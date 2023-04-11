import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

// chatGPT attempt at formatting text
function formatRapText(text) {
  const lines = text.trim().split("\n\n");
  let formattedText = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    formattedText += line;

    if (i < lines.length - 1) {
      formattedText += "<br>"; // Add a line break for each bar

      if (line.endsWith(".") || line.endsWith("!") || line.endsWith("?")) {
        formattedText += "<br>"; // Add an extra line break for each verse
      }
    }
  }

  return formattedText;
}

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [inputRapper, setInputRapper] = useState("");
  const [result, setResult] = useState();

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputRapper, userInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setResult(formatRapText(data.result));
      setUserInput("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>RapGPT</title>
      </Head>

      <main className={styles.main}>
        <h1>RapGPT</h1>
        <form onSubmit={onSubmit}>
          <p className={styles.instruction}>Choose a rapper to mimic:</p>
          <textarea
            rows="1"
            type="text"
            name="rapper input"
            value={inputRapper}
            onChange={(e) => setInputRapper(e.target.value)}
          />
          <p className={styles.instruction}>Tell me what to rap about:</p>
          <textarea
            rows="4"
            type="text"
            name="input"
            placeholder="Living in New York City"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <input type="submit" value="Submit" />
        </form>
        <br></br>

        <h4 className="resultTitle">
          Chosen Rapper: {inputRapper}
          <br></br> Context: {userInput}
        </h4>
        <h2 className="resultTitle">Here is your rap:</h2>
        <div
          className={styles.result}
          dangerouslySetInnerHTML={{ __html: result }}
        ></div>
      </main>
    </div>
  );
}
