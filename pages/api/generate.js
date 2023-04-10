import { Configuration, OpenAIApi } from "openai";

// passes API key from env
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
// creates instance of openAIApi using above configuration
const openai = new OpenAIApi(configuration);

// checks whether API key is set
export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const { inputRapper } = req.body;

  const userInput = req.body.userInput || "";
  if (userInput.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Oops, you did not enter anything",
      },
    });
    return;
  }

  // sets the options for the API
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(inputRapper, userInput),
      temperature: 0,
      max_tokens: 300,
    });
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch (error) {
    // error handling
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(inputRapper, userInput) {
  const capitalizedUserInput =
    userInput[0].toUpperCase() + userInput.slice(1).toLowerCase();
  return `you are rapGPT. you will create hip hop/rap rhymes based on the rapper ${inputRapper}. You should use your knowledge of hip hop rap to generate an entertaining rap based on, but not limited to, the user input, in order to generate creative rhymes, rather than repeating only the user input. Ensure that the text of each line is unique and not repeated more than two times. : 
  ${capitalizedUserInput} \n\n rapGPT:`;
}
