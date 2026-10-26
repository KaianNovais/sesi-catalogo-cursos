using System.Net;
using CourseCatalog.IntegrationTests.Support;

namespace CourseCatalog.IntegrationTests;

public sealed class ConcurrencyTests(CatalogTestDatabase database)
{
    [Fact]
    public async Task ClientsThatGiveUp_DoNotBreakIdenticalRequestsFromOtherClients()
    {
        // API própria: são centenas de requisições, que não podem esgotar o limite dos outros testes.
        await using var api = new CatalogApiFactory(
            database.ApiConnectionString,
            new Dictionary<string, string?> { ["RateLimiting:PermitLimitPerClient"] = "100000" });
        using var client = api.CreateClient();

        for (var round = 0; round < 20; round++)
        {
            // Consulta nova a cada rodada (fora do cache): metade dos clientes desiste logo no início.
            var path = $"/api/courses?search=rodada-{Guid.NewGuid():N}";
            var requests = Enumerable.Range(0, 16).Select(async index =>
            {
                using var giveUp = CancellationTokenSource.CreateLinkedTokenSource(TestContext.Current.CancellationToken);
                if (index % 2 == 0)
                {
                    giveUp.CancelAfter(TimeSpan.FromMilliseconds(index % 4));
                }

                try
                {
                    using var response = await client.GetAsync(path, giveUp.Token);
                    return (index, status: (HttpStatusCode?)response.StatusCode);
                }
                catch (OperationCanceledException) when (giveUp.IsCancellationRequested)
                {
                    return (index, status: (HttpStatusCode?)null);
                }
            });

            var results = await Task.WhenAll(requests);

            Assert.All(results.Where(result => result.index % 2 == 1), result => Assert.Equal(HttpStatusCode.OK, result.status));
        }
    }
}
