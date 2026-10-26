using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourseCatalog.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "catalog");

            migrationBuilder.CreateTable(
                name: "categories",
                schema: "catalog",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    color = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_categories", x => x.id);
                    table.CheckConstraint("ck_categories_color", "color ~ '^#[0-9A-Fa-f]{6}$'");
                    table.CheckConstraint("ck_categories_slug", "slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'");
                });

            migrationBuilder.CreateTable(
                name: "modalities",
                schema: "catalog",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_modalities", x => x.id);
                    table.CheckConstraint("ck_modalities_code", "code ~ '^[a-z0-9]+(-[a-z0-9]+)*$'");
                });

            migrationBuilder.CreateTable(
                name: "statuses",
                schema: "catalog",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_statuses", x => x.id);
                    table.CheckConstraint("ck_statuses_code", "code ~ '^[a-z0-9]+(-[a-z0-9]+)*$'");
                });

            migrationBuilder.CreateTable(
                name: "courses",
                schema: "catalog",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    full_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    short_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    summary = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    category_id = table.Column<int>(type: "integer", nullable: false),
                    modality_id = table.Column<int>(type: "integer", nullable: false),
                    status_id = table.Column<int>(type: "integer", nullable: false),
                    workload_hours = table.Column<int>(type: "integer", nullable: false),
                    target_audience = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    image_url = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    available_from = table.Column<DateOnly>(type: "date", nullable: true),
                    certification = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    featured = table.Column<bool>(type: "boolean", nullable: false),
                    full_name_search_key = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    short_name_search_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_courses", x => x.id);
                    table.CheckConstraint("ck_courses_image_url", "image_url ~ '^/images/courses/[a-z0-9-]+[.]webp$'");
                    table.CheckConstraint("ck_courses_slug", "slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'");
                    table.CheckConstraint("ck_courses_workload_hours", "workload_hours BETWEEN 1 AND 2000");
                    table.ForeignKey(
                        name: "fk_courses_categories_category_id",
                        column: x => x.category_id,
                        principalSchema: "catalog",
                        principalTable: "categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_courses_modalities_modality_id",
                        column: x => x.modality_id,
                        principalSchema: "catalog",
                        principalTable: "modalities",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_courses_statuses_status_id",
                        column: x => x.status_id,
                        principalSchema: "catalog",
                        principalTable: "statuses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "course_modules",
                schema: "catalog",
                columns: table => new
                {
                    position = table.Column<int>(type: "integer", nullable: false),
                    course_id = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_modules", x => new { x.course_id, x.position });
                    table.CheckConstraint("ck_course_modules_position", "position >= 1");
                    table.ForeignKey(
                        name: "fk_course_modules_courses_course_id",
                        column: x => x.course_id,
                        principalSchema: "catalog",
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "course_lessons",
                schema: "catalog",
                columns: table => new
                {
                    position = table.Column<int>(type: "integer", nullable: false),
                    course_id = table.Column<int>(type: "integer", nullable: false),
                    module_position = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_lessons", x => new { x.course_id, x.module_position, x.position });
                    table.CheckConstraint("ck_course_lessons_position", "position >= 1");
                    table.ForeignKey(
                        name: "fk_course_lessons_course_modules_course_id_module_position",
                        columns: x => new { x.course_id, x.module_position },
                        principalSchema: "catalog",
                        principalTable: "course_modules",
                        principalColumns: new[] { "course_id", "position" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_categories_slug",
                schema: "catalog",
                table: "categories",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_courses_category_id",
                schema: "catalog",
                table: "courses",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_courses_modality_id",
                schema: "catalog",
                table: "courses",
                column: "modality_id");

            migrationBuilder.CreateIndex(
                name: "ix_courses_slug",
                schema: "catalog",
                table: "courses",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_courses_status_id",
                schema: "catalog",
                table: "courses",
                column: "status_id");

            migrationBuilder.CreateIndex(
                name: "ix_modalities_code",
                schema: "catalog",
                table: "modalities",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_statuses_code",
                schema: "catalog",
                table: "statuses",
                column: "code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "course_lessons",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "course_modules",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "courses",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "categories",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "modalities",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "statuses",
                schema: "catalog");
        }
    }
}
