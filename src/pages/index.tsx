import { useState, useCallback, useEffect } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';
import { dateFormat } from '../utils/formatDates';

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
  const [posts, setPosts] = useState<PostPagination>({} as PostPagination);

  useEffect(() => {
    setPosts(postsPagination);
  }, [postsPagination]);

  const handleLoadPosts = useCallback(async () => {
    try {
      const response = await fetch(posts.next_page);
      const { results, next_page } = await response.json();

      const newPosts = results.map((newPost: Post) => {
        return {
          uid: newPost.uid,
          first_publication_date: newPost.first_publication_date,
          data: {
            title: newPost.data.title,
            subtitle: newPost.data.subtitle,
            author: newPost.data.author,
          },
        };
      });

      setPosts(prevState => {
        return {
          results: [...prevState.results, ...newPosts],
          next_page,
        };
      });
    } catch (err) {
      // eslint-disable-next-line
      console.log(err);
    }
  }, [posts.next_page]);

  return (
    <>
      <Head>
        <title>SpaceTraveling</title>
      </Head>

      <main className={styles.contentContainer}>
        <figure>
          <img src="/logo.svg" alt="Logo SpaceTraveling" />
        </figure>

        <section className={styles.posts}>
          {posts?.results?.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <article className={styles.post}>
                <h3 className={commonStyles.title}>{post.data.title}</h3>
                <p className={commonStyles.subtitle}>{post.data.subtitle}</p>

                <footer>
                  <time className={commonStyles.createdAt}>
                    <FiCalendar />
                    {dateFormat(new Date(post.first_publication_date))}
                  </time>
                  <span className={commonStyles.author}>
                    <FiUser />
                    {post.data.author}
                  </span>
                </footer>
              </article>
            </Link>
          ))}

          {posts?.next_page !== null && (
            <button type="button" onClick={() => handleLoadPosts()}>
              Carregar mais posts
            </button>
          )}
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.author', 'posts.subtitle'],
      pageSize: 2,
      ref: previewData?.ref ?? null,
    }
  );

  const posts = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
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
