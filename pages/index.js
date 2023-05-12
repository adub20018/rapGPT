import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

// chatGPT attempt at formatting text
function formatRapText(text) {
  const lines = text.trim().split("\n\n");
  let formattedText = "";

  text = text.replace(". ", ".\n\n");
  text = text.replace(":", ":\n\n");

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

// define formRemoved boolean for displaying results
// let formRemoved = false;

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [inputRapper, setInputRapper] = useState("");
  const [result, setResult] = useState();
  const [showBackButton, setShowBackButton] = useState(false);
  const [formRemoved, setFormRemoved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function onBackButtonClick() {
    // Show the form
    document.getElementById("formID").style.display = "";
    // Hide the back button
    setShowBackButton(false);
    // Clear the result
    setResult("");
    setFormRemoved(false);
  }

  async function onSubmit(event) {
    document.getElementById("formID").style.display = "none";
    setFormRemoved(true);
    setIsLoading(true);
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
      setIsLoading(false);

      const form = document.getElementById("formID");
      // remove the display of the input form when results are displayed
      form.style.display = "none";
      setFormRemoved(true);

      setUserInput("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
      setIsLoading(false);
    }
    setShowBackButton(true);
  }

  // set variables to store user input
  const chosenRapper = inputRapper;
  const chosenInput = userInput;

  return (
    <div>
      <Head>
        <title>RapGPT</title>
      </Head>

      <main className={styles.main}>
        <h1>RapGPT</h1>
        <form id="formID" onSubmit={onSubmit}>
          <p className={styles.instruction}>Choose a rapper to mimic:</p>
          <textarea
            className="textarea"
            rows="1"
            type="text"
            name="rapper input"
            value={inputRapper}
            onChange={(e) => setInputRapper(e.target.value)}
          />
          <p className={styles.instruction}>Tell me what to rap about:</p>
          <textarea
            className="textarea"
            rows="4"
            type="text"
            name="input"
            placeholder="Living in New York City"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <input type="submit" value="Submit" />
        </form>

        {formRemoved && (
          <h2 className="resultTitle">
            {!showBackButton ? "Generating" : "Here"} is your rap from{" "}
            {chosenRapper}
          </h2>
        )}
        {formRemoved && isLoading && <p>This may take up to a minute...</p>}
        {formRemoved && isLoading && <div className={styles.loader}></div>}
        {formRemoved && !isLoading && (
          <div
            className={styles.result}
            dangerouslySetInnerHTML={{ __html: result }}
          ></div>
        )}
        {/* displays the back button */}
        {showBackButton && (
          <button id={styles.goBack} onClick={onBackButtonClick}>
            Go Back
          </button>
        )}
      </main>
    </div>
  );
}
