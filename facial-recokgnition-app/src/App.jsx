import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

function App() {
  const [image, setImage] = useState("");
  const [uploadResultMessage, setUploadResultMessage] = useState(
    "Please upload an image to authenticate."
  );
  const [visitorName, setVisitorName] = useState("placeholder.jpeg");
  const [visitorImageId, setVisitorImageId] = useState("");
  const [isAuth, setAuth] = useState(false);

  function sendImage(e) {
    e.preventDefault();
    setVisitorName(image.name);
    const visitorImageName = uuidv4();
    setVisitorImageId(visitorImageName);

    fetch(
      `https://z1gph03yxh.execute-api.ap-south-1.amazonaws.com/dev/visitor-image-batch14/${visitorImageName}.jpeg`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "image/jpeg",
        },
        body: image,
      }
    )
      .then(async () => {
        const response = await authenticate(visitorImageName);
        if (response.Message === "Success") {
          setAuth(true);
          setUploadResultMessage(
            `Hi ${response["firstName"]} ${response["lastName"]}, welcome to work. Hope you have a great day!`
          );
        } else {
          setAuth(false);
          setUploadResultMessage(
            "Evadraa nuvu..! E Office employee kadhu, dobbey.."
          );
        }
      })
      .catch((error) => {
        setAuth(false);
        setUploadResultMessage(
          "There is an error during the authentication process. Please try again."
        );
        console.error(error);
      });

    async function authenticate(visitorImageName) {
      const requestUrl =
        "https://z1gph03yxh.execute-api.ap-south-1.amazonaws.com/dev/employee?" +
        new URLSearchParams({
          objectKey: `${visitorImageName}.jpeg`,
        });

      return await fetch(requestUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          return data;
        })
        .catch((error) => console.error(error));
    }
  }

  // Create a URL for the image preview
  const imageUrl =
    image && image instanceof File
      ? URL.createObjectURL(image) // Local preview for selected file
      : visitorImageId
      ? `https://visitor-image-batch14.s3.ap-south-1.amazonaws.com/${visitorImageId}.jpeg` // S3 image after upload
      : "/visitors/placeholder.jpeg"; // Updated path to the placeholder

  return (
    <div className="App">
      <h2>Batch 14 Facial Recognition System</h2>
      <form onSubmit={sendImage}>
        <input
          type="file"
          name="image"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button type="submit">Authenticate</button>
      </form>
      <div className={isAuth ? "success" : "failure"}>
        {uploadResultMessage}
      </div>
      <img src={imageUrl} alt="Visitor" height={250} width={250} />
    </div>
  );
}

export default App;
