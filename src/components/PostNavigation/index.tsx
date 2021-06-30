import Link from 'next/link';
import styles from './styles.module.scss';

interface Post {
  title: string;
  uid: string;
}

type PostNavigatorProps = {
  previous?: Post;
  next?: Post;
};

export function PostNavigation({
  next,
  previous,
}: PostNavigatorProps): JSX.Element {
  return (
    <aside className={styles.container}>
      <div className={styles.divider} />
      <nav className={styles.navigationButtons}>
        {previous ? (
          <Link href={`/post/${previous.uid}`}>
            <a>
              <h2 className={styles.title}>{previous.title}</h2>
              Post anterior
            </a>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link href={`/post/${next.uid}`}>
            <a>
              <h2 className={styles.title}>{next.title}</h2>
              Próximo Post
            </a>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </aside>
  );
}
