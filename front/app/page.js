import Image from "next/image";
import styles from "./page.module.css";
import Home from "./pages";

export default function Page() {
  return (
    <div className={styles.container}>
      
      <Home />
    </div>
  );
}
