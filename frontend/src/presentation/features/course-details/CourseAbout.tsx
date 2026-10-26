import type { Course } from '@/domain/course/Course';
import { cx } from '@/shared/utils/cx';
import { Accordion, AccordionItem } from '../../components/Accordion/Accordion';
import { SectionHeading } from '../../components/SectionHeading/SectionHeading';
import { getFaq, getLearningFormat } from '../../content/course';
import styles from './CourseDetails.module.css';

export function CourseAbout({ course }: { course: Course }) {
  const format = getLearningFormat(course.modality.code);
  const faq = getFaq(course.modality.code);

  return (
    <section className={styles.about} aria-labelledby="sobre-curso">
      <div className={cx('container', styles.aboutGrid)}>
        <div className={styles.aboutText}>
          <SectionHeading id="sobre-curso" title="Sobre o curso" />
          <p>{course.description}</p>
          <h3 className={styles.aboutSubtitle}>Público-alvo</h3>
          <p>{course.targetAudience}</p>
        </div>

        <Accordion>
          <AccordionItem title="Módulos">
            <ol role="list" className={styles.panelList}>
              {course.modules.map((module, index) => (
                <li key={module.title}>
                  <h4 className={styles.panelTitle}>
                    {index + 1}. {module.title}
                  </h4>
                  <ul className={styles.bullets}>
                    {module.lessons.map((lesson) => (
                      <li key={lesson.title}>{lesson.description}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </AccordionItem>

          <AccordionItem title={format.title}>
            <div className={styles.panelList}>
              <div>
                <h4 className={styles.panelTitle}>{format.lessonsHeading}</h4>
                <p className={styles.panelText}>{format.lessonsIntro}</p>
                <ul className={styles.bullets}>
                  {format.lessonItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className={styles.panelText}>{format.accessibility}</p>
              </div>
              <div>
                <h4 className={styles.panelTitle}>Provas e Avaliações</h4>
                <p className={styles.panelText}>{format.assessmentIntro}</p>
                <ul className={styles.bullets}>
                  {format.assessmentItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className={styles.panelText}>{format.certificate}</p>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem title="Dúvidas frequentes">
            <ol role="list" className={styles.panelList}>
              {faq.map((item, index) => (
                <li key={item.question}>
                  <h4 className={styles.panelTitle}>
                    {index + 1}. {item.question}
                  </h4>
                  <p className={styles.panelText}>{item.answer}</p>
                </li>
              ))}
            </ol>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
