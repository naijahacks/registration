var _ = require("underscore");
var async = require("async");
var User = require("../models/User");

// In memory stats.
var stats = {};
function calculateStats() {
  console.log("Calculating stats...");
  var newStats = {
    lastUpdated: 0,

    total: 0,
    demo: {
      gender: {
        M: 0,
        F: 0,
        O: 0,
        N: 0
      },
      schools: {},
      year: {
        "2016": 0,
        "2017": 0,
        "2018": 0,
        "2019": 0,
        "2020": 0,
        "2021": 0,
        "2022": 0,
        "2023": 0
      }
    },

    teams: {},
    verified: 0,
    submitted: 0,
    admitted: 0,
    confirmed: 0,
    confirmedMit: 0,
    declined: 0,

    confirmedFemale: 0,
    confirmedMale: 0,
    confirmedOther: 0,
    confirmedNone: 0,

    shirtSizes: {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      XXL: 0,
      WXS: 0,
      WS: 0,
      WM: 0,
      WL: 0,
      WXL: 0,
      WXXL: 0,
      None: 0
    },

    dietaryRestrictions: {},

    hostNeededFri: 0,
    hostNeededSat: 0,
    hostNeededUnique: 0,

    hostNeededFemale: 0,
    hostNeededMale: 0,
    hostNeededOther: 0,
    hostNeededNone: 0,

    reimbursementTotal: 0,
    reimbursementMissing: 0,

    wantsHardware: 0,

    checkedIn: 0,
    categories: {},
    cities: {},
    focusAreas: {},
    origins: {}
  };

  User.find({}).exec(function(err, users) {
    if (err || !users) {
      throw err;
    }

    newStats.total = users.length;

    let counter = 0;
    const first = "";
    const second = "";
    const third = "";
    const isToday = otherDate =>
      new Date().toDateString() === new Date(otherDate).toDateString();

    async.each(
      users,
      function(user, callback) {
        // Grab the email extension
        var email = user.email.split("@")[1];

        // Add to the gender
        newStats.demo.gender[user.profile.gender] += 1;

        // Count verified
        newStats.verified += user.verified ? 1 : 0;

        // Count submitted
        newStats.submitted += user.status.completedProfile ? 1 : 0;

        // Count accepted
        newStats.admitted += user.status.admitted ? 1 : 0;

        // Count confirmed
        newStats.confirmed += user.status.confirmed ? 1 : 0;

        // Count confirmed that are mit
        newStats.confirmedMit +=
          user.status.confirmed && email === "mit.edu" ? 1 : 0;

        newStats.confirmedFemale +=
          user.status.confirmed && user.profile.gender == "F" ? 1 : 0;
        newStats.confirmedMale +=
          user.status.confirmed && user.profile.gender == "M" ? 1 : 0;
        newStats.confirmedOther +=
          user.status.confirmed && user.profile.gender == "O" ? 1 : 0;
        newStats.confirmedNone +=
          user.status.confirmed && user.profile.gender == "N" ? 1 : 0;

        // Count declined
        newStats.declined += user.status.declined ? 1 : 0;

        // Count the number of people who need reimbursements
        newStats.reimbursementTotal += user.confirmation.needsReimbursement
          ? 1
          : 0;

        // Count the number of people who still need to be reimbursed
        newStats.reimbursementMissing +=
          user.confirmation.needsReimbursement &&
          !user.status.reimbursementGiven
            ? 1
            : 0;

        // Count the number of people who want hardware
        newStats.wantsHardware += user.confirmation.wantsHardware ? 1 : 0;

        // Count schools
        if (!newStats.demo.schools[email]) {
          newStats.demo.schools[email] = {
            submitted: 0,
            admitted: 0,
            confirmed: 0,
            declined: 0
          };
        }
        newStats.demo.schools[email].submitted += user.status.completedProfile
          ? 1
          : 0;
        newStats.demo.schools[email].admitted += user.status.admitted ? 1 : 0;
        newStats.demo.schools[email].confirmed += user.status.confirmed ? 1 : 0;
        newStats.demo.schools[email].declined += user.status.declined ? 1 : 0;

        // Count graduation years
        if (user.profile.graduationYear) {
          newStats.demo.year[user.profile.graduationYear] += 1;
        }

        // Grab the team name if there is one
        if (user.teamCode && user.teamCode.length > 0) {
          if (!newStats.teams[user.teamCode]) {
            newStats.teams[user.teamCode] = [];
          }
          newStats.teams[user.teamCode].push(user.profile.name);
        }

        // Grab the category name if there is one
        if (
          user.profile &&
          user.profile.focus &&
          user.profile.focus.length > 0
        ) {
          if (!newStats.categories[user.profile.focus]) {
            newStats.categories[user.profile.focus] = [];
          }
          newStats.categories[user.profile.focus].push(user.profile.name);
        }
        if (
          user.confirmation &&
          user.confirmation.address &&
          user.confirmation.address.city &&
          user.confirmation.address.city.length > 0
        ) {
          let city = user.confirmation.address.city.toLowerCase();
          if (
            city.includes("lagos") ||
            city.includes("lekki") ||
            city.includes("mainland") ||
            city.includes("ikoyi") ||
            city.includes("oshodi") ||
            city.includes("agege") ||
            city.includes("yaba")
          ) {
            city = "lagos";
          }
          if (!newStats.cities[city]) {
            newStats.cities[city] = 1;
          }
          newStats.cities[city] += 1;
        }
        if (
          user.confirmation &&
          user.confirmation.focusArea &&
          user.confirmation.focusArea.length > 0
        ) {
          const { focusArea } = user.confirmation;

          if (!newStats.focusAreas[focusArea]) {
            newStats.focusAreas[focusArea] = 1;
          }
          newStats.focusAreas[focusArea] += 1;
        }
        if (
          user.confirmation &&
          user.confirmation.origin &&
          user.confirmation.origin.length > 0
        ) {
          const { origin } = user.confirmation;

          if (!newStats.origins[origin]) {
            newStats.origins[origin] = 1;
          }
          newStats.origins[origin] += 1;
        }
        // if (user.status.name == "incomplete") {
        //   console.log(user.email);
        // }
        // if (user.status.name == "confirmed") {
        //   //   console.log(user.email);
        // }
        if (user.status.name == "confirmed") {
          // console.log(user.profile.phoneNumber);
          counter += 1;
          // if (counter <= 300) {
          //   console.log(user.email);
          //   if (counter == 300) {
          //     console.log("\n\n");
          //   }
          // } else if (counter <= 600) {
          //   console.log(user.email);
          //   if (counter == 600) {
          //     console.log("\n\n");
          //   }
          // } else if (counter <= 900) {
          //   console.log(user.email);
          //   if (counter == 900) {
          //     console.log("\n\n");
          //   }
          // } else {
          //   console.log(user.email);
          // }
        }
        // console.log(profile.name, user.email);

        // Needs to join team
        // if (
        //   user.status.name == "submitted" &&
        //   (!user.teamCode || user.teamCode.length < 1)
        // ) {
        //   console.log(user.email);
        // }

        // Count shirt sizes
        if (user.confirmation.shirtSize in newStats.shirtSizes) {
          newStats.shirtSizes[user.confirmation.shirtSize] += 1;
        }

        // Host needed counts
        newStats.hostNeededFri += user.confirmation.hostNeededFri ? 1 : 0;
        newStats.hostNeededSat += user.confirmation.hostNeededSat ? 1 : 0;
        newStats.hostNeededUnique +=
          user.confirmation.hostNeededFri || user.confirmation.hostNeededSat
            ? 1
            : 0;

        newStats.hostNeededFemale +=
          (user.confirmation.hostNeededFri ||
            user.confirmation.hostNeededSat) &&
          user.profile.gender == "F"
            ? 1
            : 0;
        newStats.hostNeededMale +=
          (user.confirmation.hostNeededFri ||
            user.confirmation.hostNeededSat) &&
          user.profile.gender == "M"
            ? 1
            : 0;
        newStats.hostNeededOther +=
          (user.confirmation.hostNeededFri ||
            user.confirmation.hostNeededSat) &&
          user.profile.gender == "O"
            ? 1
            : 0;
        newStats.hostNeededNone +=
          (user.confirmation.hostNeededFri ||
            user.confirmation.hostNeededSat) &&
          user.profile.gender == "N"
            ? 1
            : 0;

        // Dietary restrictions
        if (user.confirmation.dietaryRestrictions) {
          user.confirmation.dietaryRestrictions.forEach(function(restriction) {
            if (!newStats.dietaryRestrictions[restriction]) {
              newStats.dietaryRestrictions[restriction] = 0;
            }
            newStats.dietaryRestrictions[restriction] += 1;
          });
        }

        // Count checked in
        newStats.checkedIn += user.status.checkedIn ? 1 : 0;

        callback(); // let async know we've finished
      },
      function() {
        // Transform dietary restrictions into a series of objects
        var restrictions = [];
        _.keys(newStats.dietaryRestrictions).forEach(function(key) {
          restrictions.push({
            name: key,
            count: newStats.dietaryRestrictions[key]
          });
        });
        newStats.dietaryRestrictions = restrictions;

        // Transform schools into an array of objects
        var schools = [];
        _.keys(newStats.demo.schools).forEach(function(key) {
          schools.push({
            email: key,
            count: newStats.demo.schools[key].submitted,
            stats: newStats.demo.schools[key]
          });
        });
        newStats.demo.schools = schools;

        // Likewise, transform the teams into an array of objects
        var teams = [];
        _.keys(newStats.teams).forEach(function(key) {
          teams.push({
            name: key,
            users: newStats.teams[key]
          });
        });
        newStats.teams = teams;

        // Likewise, transform the categories into an array of objects
        var categories = [];
        const tracks = {
          B: "Beginner Category",
          M: "Main Category"
        };
        _.keys(newStats.categories).forEach(function(key) {
          categories.push({
            name: tracks[key],
            users: newStats.categories[key]
          });
        });
        newStats.categories = categories;

        const focusAreas = [];
        _.keys(newStats.focusAreas).forEach(function(key) {
          focusAreas.push({
            name: key,
            total: newStats.focusAreas[key]
          });
        });
        newStats.focusAreas = focusAreas;

        const origins = [];
        let totalReimbursementAmount = 0;
        _.keys(newStats.origins).forEach(function(key) {
          const originTotal = newStats.origins[key];
          let amount = 0;
          switch (key) {
            case "west":
              amount = 2500 * originTotal;
              totalReimbursementAmount += amount;
              break;
            case "east":
              amount = 4000 * originTotal;
              totalReimbursementAmount += amount;
              break;
            case "nigeria":
              amount = 5000 * originTotal;
              totalReimbursementAmount += amount;
              break;
            case "africa":
              amount = 10000 * originTotal;
              totalReimbursementAmount += amount;
              break;
            case "world":
              amount = 15000 * originTotal;
              totalReimbursementAmount += amount;
              break;
            default:
            // code block
          }
          origins.push({
            name: key,
            total: newStats.origins[key],
            amount
          });
        });
        newStats.origins = origins;
        newStats.totalReimbursementAmount = totalReimbursementAmount;

        const cities = [];
        _.keys(newStats.cities).forEach(function(key) {
          cities.push({
            name: key,
            total: newStats.cities[key]
          });
        });
        newStats.cities = cities;

        // console.log(`Name,Total`);
        // for (const { name, total } of newStats.cities) {
        //   console.log(`${name},${total}`);
        // }

        console.log("Stats updated!");
        newStats.lastUpdated = new Date();
        stats = newStats;
      }
    );
  });
}

// Calculate once every five minutes.
calculateStats();
setInterval(calculateStats, 300000);

var Stats = {};

Stats.getUserStats = function() {
  return stats;
};

module.exports = Stats;
