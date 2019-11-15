const pdClient = require("node-pagerduty");
const util = require("util");
const sleep = util.promisify(setTimeout);

if (process.env.APITOKEN && process.env.REGEX) {
  const pdapiToken = process.env.APITOKEN;
  const regex = process.env.REGEX;
  const desiredStatus = process.env.UPDATESTATUS || "acknowledged";
  const queryInterval = process.env.QUERYINTERVAL || 10000;
  const pd = new pdClient(pdapiToken);
  processIncidents(pd, desiredStatus, regex, queryInterval);
} else {
  console.error("FATAL ERROR: Missing env var for APITOKEN or REGEX");
  process.exit(1);
}

async function processIncidents(pdClient, desiredStatus, regex, queryInterval) {
  console.log("Checking to see who this API key belongs to")
  let currentUser = JSON.parse((await pdClient.users.getCurrentUser()).body)
    .user;
  let currentUserId = currentUser.id;
  let currentUserEmail = currentUser.email;
  console.log(`API key belongs to ${currentUserEmail}`);
  for (;;) {
    try {
      console.log("Checking for triggered incidents")
      let allTriggeredIncidents = JSON.parse(
        (
          await pdClient.incidents.listIncidents({
            date_range: "all",
            statuses: ["triggered"],
            user_ids: [currentUserId]
          })
        ).body
      ).incidents;

      let myTriggeredIncidents = allTriggeredIncidents.filter(incident =>
        regex.test(incident.title)
      );

      for (let i = 0; i < myTriggeredIncidents.length; i++) {
        await pdClient.incidents.updateIncident(
          myTriggeredIncidents[i].id,
          currentUserEmail,
          {
            incident: {
              type: "incident_reference",
              status: desiredStatus
            }
          }
        );
        console.log(
          `${desiredStatus} incident: "${myTriggeredIncidents[i].title}"`
        );
      }
    } catch (error) {
      console.error(error);
    }

    console.log(`Sleeping ${queryInterval}ms`)
    await sleep(queryInterval);
  }
}
