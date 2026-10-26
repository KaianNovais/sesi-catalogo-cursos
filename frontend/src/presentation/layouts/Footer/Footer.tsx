import { Link } from 'react-router';
import { cx } from '@/shared/utils/cx';
import { Icon } from '../../components/Icon/Icon';
import { Logo } from '../../components/Logo/Logo';
import {
  footerNavigation,
  popularCourses,
  site,
  socialLinks,
  supportLinks,
} from '../../content/site';
import { anchors } from '../../routes/anchors';
import { paths } from '../../routes/paths';
import styles from './Footer.module.css';

export function Footer() {
  return (
    // tabIndex -1: alvo do atalho "Ir para o rodapé" (recebe o foco sem entrar na ordem do Tab)
    <footer id={anchors.footer} tabIndex={-1} className={styles.footer}>
      <div className={cx('container', styles.columns)}>
        <div className={cx(styles.brand, styles.areaBrand)}>
          <Link
            to={paths.home}
            className={styles.logo}
            aria-label={`${site.name} — página inicial`}
          >
            <Logo />
          </Link>
          <address className={styles.contact}>
            <a href={`mailto:${site.email}`} className={styles.contactLink}>
              {site.email}
            </a>
            <span>{site.address}</span>
          </address>
        </div>

        <nav aria-labelledby="footer-navegacao" className={styles.areaNav}>
          <h2 id="footer-navegacao" className={styles.heading}>
            Navegação
          </h2>
          <ul role="list" className={styles.list}>
            {footerNavigation.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className={styles.link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-cursos" className={styles.areaCourses}>
          <h2 id="footer-cursos" className={styles.heading}>
            Cursos populares
          </h2>
          <ul role="list" className={styles.list}>
            {popularCourses.map((name) => (
              <li key={name}>
                <Link to={paths.catalog} className={styles.link}>
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-suporte" className={styles.areaSupport}>
          <h2 id="footer-suporte" className={styles.heading}>
            Suporte
          </h2>
          <ul role="list" className={styles.list}>
            {supportLinks.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className={styles.link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={cx('container', styles.bottom)}>
        <p className={styles.copyright}>
          <Logo variant="sesi" className={styles.sesiLogo} title="SESI" />
          <span>Todos os direitos reservados.</span>
        </p>
        <ul role="list" className={styles.social}>
          {socialLinks.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label={`${social.label} do SESI (abre em nova aba)`}
              >
                <Icon name={social.icon} size={24} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
