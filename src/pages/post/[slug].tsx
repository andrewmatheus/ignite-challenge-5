import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import Header from '../../components/Header';
import { dateFormat } from '../../utils/formatDates';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

function calculateEstimatedReadingTime(postInformed: Post): number {
  const wordsPerMinute = 200;
  const { content } = postInformed.data;

  const contentBodyCount = RichText.asText(
    content.reduce((acc, data) => [...acc, ...data.body], [])
  ).split(' ').length;

  const headingCount = RichText.asText(
    content.reduce((acc, data) => [...acc, data.heading], [])
  ).split(' ').length;

  const totalCount = headingCount + contentBodyCount;

  const readingEstimatedTime = Math.ceil(totalCount / wordsPerMinute);
  return readingEstimatedTime;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h2>Carregando...</h2>;
  }

  const totalMinReadingTime = calculateEstimatedReadingTime(post);

  return (
    <>
      <Head>
        <title>{`spacetraveling | ${post.data.title}`}</title>
      </Head>

      <Header />

      <img src={post.data.banner.url} alt="banner" className={styles.banner} />

      <main className={styles.main}>
        <section className={styles.post}>
          <h1 className={commonStyles.title}>{post.data.title}</h1>

          <aside>
            <ul>
              <li>
                <time className={commonStyles.createdAt}>
                  <FiCalendar />
                  {dateFormat(new Date(post.first_publication_date))}
                </time>
              </li>
              <li>
                <span className={commonStyles.author}>
                  <FiUser />
                  {post.data.author}
                </span>
              </li>
              <li>
                <span className={styles.estimatedReadingTime}>
                  <FiClock />
                  {`${totalMinReadingTime} min`}
                </span>
              </li>
            </ul>
          </aside>

          {post &&
            post.data?.content.map(dataContentPost => (
              <article key={dataContentPost.heading}>
                <strong
                  className={commonStyles.title}
                  style={{ marginBottom: '2rem' }}
                >
                  {dataContentPost.heading}
                </strong>

                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(dataContentPost.body),
                  }}
                />
              </article>
            ))}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params;

  const response = await prismic.getByUID('posts', String(slug), {
    ref: null,
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(itemContent => {
        return {
          heading: itemContent.heading,
          body: itemContent.body,
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30, // 30min
  };
};
