import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useCallback } from 'react';

import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  console.log(postsPagination);

  const handleLoadPosts = useCallback(() => {
    //
  }, []);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <main className={styles.contentContainer}>
        <figure>
          <img src="/logo.svg" alt="Logo SpaceTraveling" />
        </figure>

        <section className={styles.posts}>
          {postsPagination &&
            postsPagination.results.map(post => (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <article className={styles.post}>
                  <h3 className={commonStyles.title}>{post.data.title}</h3>
                  <p className={commonStyles.subtitle}>{post.data.subtitle}</p>

                  <footer>
                    <time className={commonStyles.createdAt}>
                      <FiCalendar />
                      <time>{post.first_publication_date}</time>
                    </time>
                    <span className={commonStyles.author}>
                      <FiUser />
                      {post.data.author}
                    </span>
                  </footer>
                </article>
              </Link>
            ))}

          {postsPagination && postsPagination.next_page !== null && (
            <button type="button" onClick={() => handleLoadPosts()}>
              Carregar mais posts
            </button>
          )}
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  );

  const posts = response.results.map(post => {
    const datePost = parseISO(post.first_publication_date);
    const dateFormatted = format(datePost, 'dd MMM yyyy', {
      locale: pt,
    });
    return {
      uid: post.uid,
      first_publication_date: dateFormatted,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: response.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 60 * 24,
  };
};
