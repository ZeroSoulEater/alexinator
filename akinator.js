var winston = require('winston');
var request = require('request');

var url = 'http://api-de1.akinator.com/ws/';

/*
  createSession
  Öffnet eine neue Session zur Akinator API und liefert die SessionID zurück

*/
exports.createSession = function(){
  return new Promise(
    function (resolve, reject) {
      request(url + 'new_session?partner=1&player=alexinator', function(error, response, body) {
        if (!error && response.statusCode == 200) {
          // Sucessfull request save data
          var rs = JSON.parse(body);
          var sessionID   = rs.parameters.identification.session;
          var signatureID = rs.parameters.identification.signature;
          var stepNu      = rs.parameters.step_information.step;
          var questionStr = rs.parameters.step_information.question;

            resolve({session: sessionID,signature: signatureID, step: stepNu, question: questionStr});
          }else{
            reject(new Error("Request failed cant get session"));
          }
        });
    });
}


/**
sendAnswer
sends the players answer to the akinator server
Returns a new question from the akinator API.

Parameter:
  answerId:   the Players answer
  session:    the Akinator SessionID of the player
  signature:  the Akinator signature
  step:       the Step number
  cb:         the callback function

*/
exports.sendAnswer = function(answer, session, signature, step) {
  var answerId;
  // Set the answerID
  switch (answer) {
    case 'ja':
      answerId = 0;
      break;

    case 'nein':
      answerId = 1;
      break;

    case 'ich weiß es nicht':
    case 'ich weiß nicht':
      answerId = 2;
      break;

    case 'Wahrscheinlich':
      answerId = 3;
      break;

    case 'Wahrscheinlich nicht':
      answerId = 4;
      break;

    default:
      answerId=false;
      if(cb)
        cb({error:"ungültige Antwort", errorNu:"-1"});
      else{
        return false;
      }
  }

  return new Promise(
    function (resolve, reject) {
      request(url + 'answer?session=' + session + '&signature=' + signature + '&step=' + step + '&answer=' + answerId, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var rs = JSON.parse(body);
          var questionStr = rs.parameters.step_information.question;
          var stepNu = rs.parameters.step_information.step;
          // On success return question
          resolve({question: questionStr, step: stepNu})
        }else{
          // On Error
          reject(new Error("Request fehlgeschlagen cant send Answer"));
        }
      });
    } // function
  );// Promise
}
