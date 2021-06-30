import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import Header from '../../components/Header';
import { PostNavigation } from '../../components/PostNavigation';
import { Comments } from '../../components/Comments';
import { ExitPreviewButton } from '../../components/ExitPreviewButton';
import { dateFormat, dateHourFormat } from '../../utils/formatDates';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
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
  preview: boolean;
  previousPost?: {
    uid: string;
    title: string;
  };
  nextPost?: {
    uid: string;
    title: string;
  };
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

export default function Post({
  post,
  preview,
  nextPost,
  previousPost,
}: PostProps): JSX.Element {
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

            {post.last_publication_date && (
              <time className={styles.timeUpdated}>
                {dateHourFormat(new Date(post.last_publication_date))}
              </time>
            )}
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

          <PostNavigation next={nextPost} previous={previousPost} />

          <Comments
            repositoryURL="andrewmatheus/ignite-challenge-5"
            issueTerm="pathname"
            theme="github-dark"
            crossOrigin="anonymous"
            label="Utterances Comments"
            async
          />

          {preview && <ExitPreviewButton />}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.uid'],
      pageSize: 3,
    }
  );

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

export const getStaticProps: GetStaticProps<PostProps> = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  if (!response) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
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

  let previousPost = null;
  let nextPost = null;

  if (!preview) {
    const responsePreviousPost = await prismic.query(
      [
        Prismic.predicates.at('document.type', 'posts'),
        Prismic.predicates.dateAfter(
          'document.first_publication_date',
          post.first_publication_date
        ),
      ],
      {
        fetch: ['posts.title'],
        pageSize: 1,
        page: 1,
      }
    );

    if (responsePreviousPost.results.length > 0) {
      previousPost = {
        uid: responsePreviousPost.results[0].uid,
        title: responsePreviousPost.results[0].data?.title,
      };
    }

    const responseNextPost = await prismic.query(
      [
        Prismic.predicates.at('document.type', 'posts'),
        Prismic.predicates.dateBefore(
          'document.first_publication_date',
          post.first_publication_date
        ),
      ],
      {
        fetch: ['posts.title'],
        pageSize: 1,
        page: 1,
      }
    );

    if (responseNextPost.results.length > 0) {
      nextPost = {
        uid: responseNextPost.results[0].uid,
        title: responseNextPost.results[0].data?.title,
      };
    }
  }

  return {
    props: {
      post,
      preview,
      nextPost,
      previousPost,
    },
    revalidate: 60 * 30, // 30min
  };
};
