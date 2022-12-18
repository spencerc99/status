import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.scss";
import { Activity, ActivityType } from "./api/me";
import { Metadata } from "./api/metadata";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>spencer's status card</title>
        <meta name="description" content="spencer's dynamic status card" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Card />
      </main>

      <footer className={styles.footer}>net art from spencer chang</footer>
    </div>
  );
}

function Card() {
  return (
    <div className={styles.content}>
      <p>coming soon...</p>
      {/* <Status /> */}
    </div>
  );
}

function Status() {
  const [status, setStatus] = useState<
    Record<ActivityType, Activity> | undefined
  >();
  const [location, setLocation] = useState<string | undefined>();

  const fetchStatus = async () => {
    const response = await fetch("/api/me");
    const data = await response.json();
    const status = data.reduce((acc, cur) => {
      acc[cur.category] = cur;
      return acc;
    }, {} as Record<ActivityType, Activity>);
    setStatus(status);
  };

  const fetchLocation = async () => {
    const response = await fetch("/api/metadata");
    const data: Metadata = await response.json();
    console.log(data);
    setLocation(data.location);
  };

  useEffect(() => {
    void fetchStatus();
    void fetchLocation();
  }, []);

  return !location || !status ? (
    <>Loading...</>
  ) : (
    <>
      <div className={styles.row}>
        <div>
          <div className={styles.activity}>
            {/* ADD HEADER BACKGROUND */}
            <h3>
              Spencer Chang{" "}
              <img
                className={styles.stamp}
                src="/stamp-desaturated-square.png"
              />
            </h3>{" "}
            <span className={styles.weather}>🗺️ {location}</span>
          </div>
          <div className={styles.rowEven}>
            <div
              className={styles.activity}
              dangerouslySetInnerHTML={{
                __html: status[ActivityType.Listening].displayHTML,
              }}
            ></div>
            <div
              className={styles.activity}
              dangerouslySetInnerHTML={{
                __html: status[ActivityType.Reading].displayHTML,
              }}
            ></div>
          </div>
        </div>
        <a href="https://spencerchang.me/window#selfie">
          <div className={styles.windowContainer}>
            <iframe
              src="https://spencerchang.me/window#selfie"
              className={styles.window}
            />
          </div>
        </a>
      </div>
      <div className={styles.rowEven}>
        <div
          className={styles.activity}
          dangerouslySetInnerHTML={{
            __html: status[ActivityType.Writing].displayHTML,
          }}
        ></div>
        <div
          className={styles.activity}
          dangerouslySetInnerHTML={{
            __html: status[ActivityType.Building].displayHTML,
          }}
        ></div>
      </div>
      <div className={styles.rowOpposite}>
        <a href="https://spencerchang.me/window#sky">
          <div className={styles.windowContainer}>
            <iframe
              src="https://spencerchang.me/window#sky"
              className={styles.window}
            />
          </div>
        </a>
        <div>
          <div
            className={styles.activity}
            dangerouslySetInnerHTML={{
              __html: status[ActivityType.Moving].displayHTML,
            }}
          ></div>
          <div
            className={styles.activity}
            dangerouslySetInnerHTML={{
              __html: status[ActivityType.Reciting].displayHTML,
            }}
          ></div>
        </div>
      </div>
    </>
  );
}
