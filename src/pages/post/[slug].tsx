import { GetStaticPaths, GetStaticProps } from 'next';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
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

// function calculateEstimatedReadingTime(post: Post): number {
//   const wordsPerMinute = 200;
//   const wordsCount =
//     RichText.asText(
//       post.data.content.reduce((acc, data) => [...acc, ...data.body], [])
//     ).split(' ').length +
//     RichText.asText(
//       post.data.content.reduce((acc, data) => {
//         if (data.heading) {
//           return [...acc, ...data.heading.split(' ')];
//         }
//         return [...acc];
//       }, [])
//     ).split(' ').length;

//   const readingEstimatedTime = Math.ceil(wordsCount / wordsPerMinute);
//   return readingEstimatedTime;
// }

// export default function Post() {
//   // TODO
// }

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

//   // TODO
// };

// export const getStaticProps = async context => {
//   const prismic = getPrismicClient();
//   const response = await prismic.getByUID(TODO);

//   // TODO
// };
