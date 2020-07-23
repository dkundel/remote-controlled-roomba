function getInfoFromMemory(Memory) {
  Memory = JSON.parse(Memory).twilio;

  if (
    typeof Memory.collected_data === 'undefined' ||
    typeof Memory.collected_data.collect_team_info === 'undefined'
  ) {
    return {};
  }

  const { answers } = Memory.collected_data.collect_team_info;

  console.log(answers);
  let Username = undefined;
  if (answers.Username) {
    Username = answers.Username.answer;
  }

  let Team = undefined;
  if (answers.Team) {
    Team = answers.Team.answer;
  }

  return { Username, Team };
}

exports.handler = async function (context, event, callback) {
  const { Memory } = event;
  const { Username, Team } = getInfoFromMemory(Memory);

  const questions = [];

  // if (!Team) {
  questions.push({
    question: 'What team would you like to join? Red or Blue?',
    prefill: 'Team',
    name: 'Team',
    type: 'TeamColor',
  });
  // }

  if (!Username) {
    questions.push({
      question: `What is your DEV.to username? We'll show your profile picture next to the command you sent. Write "skip" to stay anonymous. The username is case-sensitive.`,
      name: 'Username',
    });
  }

  // let
  callback(null, {
    actions: [
      {
        collect: {
          name: 'collect_team_info',
          questions: questions,
          on_complete: {
            redirect: 'task://welcome',
          },
        },
      },
      {
        listen: true,
      },
    ],
  });
};
