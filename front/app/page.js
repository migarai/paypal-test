import Image from "next/image";
import styles from "./page.module.css";
import Home from "./pages";

export default function Page() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Image src="/logo.png" alt="logo" width={50} height={50} />
        <h1>Book a Counseling Session</h1>
      </header>
      <Home />
    </div>
  );
}
