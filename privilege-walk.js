var Results = new Mongo.Collection('results');

if (Meteor.isClient) {
  Meteor.subscribe('results');

  var questions = [
    "If your parents worked nights and weekends to support your family, take one step back.",
    "If you are able to move through the world without fear of sexual assault, take one step forward.",
    "If you can show affection for your romantic partner in public without fear of ridicule or violence, take one step forward.",
    "If you have ever been diagnosed as having a physical or mental illness/disability, take one step back.",
    "If the primary language spoken in your household growing up was not English, take one step back.",
    "If you came from a supportive family environment take one step forward.",
    "If you have ever tried to change your speech or mannerisms to gain credibility, take one step back.",
    "If you can go anywhere in the country, and easily find the kinds of hair products you need and/or cosmetics that match your skin color, take one step forward.",
    "If you were embarrassed about your clothes or house while growing up, take one step back.",
    "If you can make mistakes and not have people attribute your behavior to flaws in your racial/gender group, take one step forward.",
    "If you can legally marry the person you love, regardless of where you live, take one step forward.",
    "If you were born in the United States or Canada, take one step forward.",
    "If you or your parents have ever gone through a divorce, take one step back.",
    "If you felt like you had adequate access to healthy food growing up, take one step forward",
    "If you are reasonably sure you would be hired for a job based on your ability and qualifications, take one step forward.",
    "If you would never think twice about calling the police when trouble occurs, take one step forward.",
    "If you can see a doctor whenever you feel the need, take one step forward.",
    "If you feel comfortable being emotionally expressive/open, take one step forward.",
    "If you have ever been the only person of your race, gender, socio-economic status, or sexual orientation in a classroom or workplace setting, please take one step back.",
    "If you took out loans for your education take one step backward.",
    "If you get time off for your religious holidays, take one step forward. ",
    "If you had a job during your high school and college years, take one step back.",
    "If you feel comfortable walking home alone at night, take one step forward.",
    "If you have ever traveled outside the United States or Canada, take one step forward.",
    "If you have ever felt like there was NOT adequate or accurate representation of your racial group, sexual orientation group, gender group, and/or disability group in the media, take one step back.",
    "If you feel confident that your parents would be able to financially help/support you if you were going through a financial hardship, take one step forward.",
    "If you have ever been bullied or made fun of based on something that you can’t change, take one step back.",
    "If there were more than 50 books in your house growing up, take one step forward.",
    "If you studied the culture or the history of your ancestors in elementary school take one step forward.",
    "If your parents or guardians attended college, take one step forward.",
    "If you ever went on a family vacation, take one step forward.",
    "If you can buy new clothes or go out to dinner when you want to, take one step forward.",
    "If you were ever offered a job because of your association with a friend or family member, take one step forward.",
    "If one of your parents was ever laid off or unemployed not by choice, take one step back.",
    "If you were ever uncomfortable about a joke or a statement you overheard related to your race, ethnicity, gender, appearance, or sexual orientation but felt unsafe to confront the situation, take one step back."
  ];

  var nextQuestion = function (direction) {
    questions.shift();
    Session.set('questions', questions);
    Session.set('currentQuestion', questions[0]);

    // 35 questions, therefore 2.857
    var dir = 0;
    var amountToMove = 2.857;

    if (direction === 'B') {
      dir = Math.abs(amountToMove) * -1;
    } else if (direction === 'F') {
      dir = amountToMove;
    }

    Session.set('position', Session.get('position') + dir);

    if (!Session.get('questions').length) {
      Session.set('finished', true);
      Meteor.call('store', Session.get('counter'));
    }
  };

  Session.setDefault('counter', 0);
  Session.setDefault('show', false);
  Session.setDefault('finished', false);
  Session.setDefault('questions', questions);
  Session.setDefault('currentQuestion', questions[0]);
  Session.setDefault('position', 50);

  Template.privilege.helpers({
    counter: function () {
      return Session.get('counter');
    },

    show: function () {
      return Session.get('show');
    },

    finished: function () {
      return Session.get('finished');
    },

    questions: function () {
      return Session.get('questions');
    },

    currentQuestion: function () {
      return Session.get('currentQuestion');
    },

    position: function () {
      return Session.get('position');
    },

    getPosition: function () {
      return Session.get('position') + '%';
    },

    results: function () {
      return Results.find({});
    },

    average: function () {
      var sum = 0;
      var count = Results.find({}).map(function (r) {
        sum += r.score;
      }).length;

      return (sum/count).toFixed(2);
    },

    colour: function () {
      var pos = Session.get('position');
      var c = '#a1a1a1';

      if (pos > 50) {
        c = 'green';
      } else if (pos < 50) {
        c = 'red';
      }

      return c;
    }
  });

  Template.privilege.events({
    'click [data-forward]': function () {
      Session.set('counter', Session.get('counter') + 1);
      nextQuestion('F');
    },

    'click [data-back]': function () {
      Session.set('counter', Session.get('counter') - 1);
      nextQuestion('B');
    },

    'click [data-stay]': function () {
      nextQuestion();
    },

    'click [data-start]': function () {
      Session.set('show', true);
    }
  });

}

if (Meteor.isServer) {
  Meteor.publish('results', function () {
    return Results.find();
  });

  var ip;

  Meteor.onConnection(function(conn) {
    ip = conn.clientAddress;
  });

  Meteor.startup(function () {
    Meteor.methods({
      store: function (value) {
        var date = new Date();
        var result = {
          score: value,
          ipAddress: ip,
          createdAt: date,
          createdAtHuman: moment(date).format('MMMM D, YYYY – h:mm a')
        };

        Results.insert(result);
      }
    });
  });

}
