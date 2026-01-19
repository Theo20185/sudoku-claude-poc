/**
 * App Layout Component
 *
 * Main layout with header, left panel (1/3), and right panel (2/3).
 */

import { ReactNode } from "react";
import { Header } from "../Header/Header";
import styles from "./AppLayout.module.scss";

interface AppLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function AppLayout({ leftPanel, rightPanel }: AppLayoutProps) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <div className={styles.leftPanel}>{leftPanel}</div>
        <div className={styles.rightPanel}>{rightPanel}</div>
      </main>
    </div>
  );
}
