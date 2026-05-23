let validatedInput = {};
let rankedVehicles = [];

async function sendDataForVehicles(make, year) {
  return $.ajax({
    type: "POST",
    url: "https://r2lnjwzer4.execute-api.us-east-1.amazonaws.com/dev/vehicle-pool",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      make: make,
      year: year,
    }),
    error: function (jqxHR, status, error) {
      console.log("Error", jqxHR, status, error);
    },
  });
}

// async function getVehicles(){
//     validatedInput = await getValidatedInputToDisplay()
//     let make;
//     const year = validatedInput["preferredYear"];

//     if (validatedInput["preferredMake"]){ //if preferred vehicle not null
//         make = validatedInput["preferredMake"];
//     }
//     else{ // if preferred vehicle null
//         make = validatedInput["currMake"];
//     }

//     //get vehicles
//     const response = await sendDataForVehicles(make, year);

//     // store ranked vehicles in a global variable
//     rankedVehicles = response?.rankedVehicles ?? [];
//     console.log("Recommended Vehicles: ", rankedVehicles);

// }

//send question to system
async function getVehicles() {
  validatedInput = await getValidatedInputToDisplay();

  const year = validatedInput["preferredYear"];
  const make = validatedInput["preferredMake"] ?? validatedInput["currMake"];

  const response = await sendDataForVehicles(make, year);

//   console.log("RAW RESPONSE:", response);

  const parsed = response?.body
    ? typeof response.body === "string"
      ? JSON.parse(response.body)
      : response.body
    : response;

  rankedVehicles = parsed?.rankedVehicles ?? [];

//   console.log("PARSED RESPONSE:", parsed);
//   console.log("RECOMMENDED VEHICLES:", rankedVehicles);
}

async function converse(question, vehicleList) {
  return $.ajax({
    type: "POST",
    url: "https://r2lnjwzer4.execute-api.us-east-1.amazonaws.com/dev/vehicle-pool",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      question: question,
      rankedVehicles: vehicleList,
    }),
    error: function (jqxHR, status, error) {
      console.log("Error", jqxHR, status, error);
    },
  });
}

async function getLLMResponse(question) {
  const response = await converse(question, rankedVehicles);

  console.log("RAW LLM RESPONSE:", response);

  const parsed = response?.body
    ? typeof response.body === "string"
      ? JSON.parse(response.body)
      : response.body
    : response;

  const llmAnswer = parsed?.answer ?? null;

  console.log("QUESTION:", question);
  console.log("LLM ANSWER:", llmAnswer);

  return llmAnswer;
}

function formattedVehicleListToDisplay(vehicles, vehicleYear) {
  let message = "Here are 3 vehicles that match your preferences:<br><br>";

  vehicles.slice(0, 3).forEach((vehicle, index) => {
    const model = vehicle?.model ?? null;
    const make = vehicle?.make ?? null;
    message += `<div class = "vehicle-line">${index + 1}. ${vehicleYear} ${make} ${model}</div>`;
  });

  message += "<br>Feel free to ask me questions regarding these vehicles!";
  return message;
}
