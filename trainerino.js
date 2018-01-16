// TODO: Replace with your project's config object. You can find this
// by navigating to your project's console overview page
// (https://console.firebase.google.com/project/your-project-id/overview)
// and clicking "Add Firebase to your web app"

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyB03K09BT2Y8S1FHNkRdQj1zMPZqk_JcEI",
    authDomain: "trainproject-29024.firebaseapp.com",
    databaseURL: "https://trainproject-29024.firebaseio.com",
    projectId: "trainproject-29024",
    storageBucket: "trainproject-29024.appspot.com",
    messagingSenderId: "773904929601"
  };
 
// Initialize your Firebase app
firebase.initializeApp(config);

// Reference to the trainSchedule object in your Firebase database
var trainSchedule = firebase.database().ref("trainSchedule");

// Save a new recommendation to the database, using the input in the form
var submitTrainSchedule = function () {

  // Get input values from each of the form elements
  var name = $("#train-name").val();
  console.log(name);
  var destination = $("#train-destination").val();
  var time = $("#train-time").val();
  var frequency = $("#train-frequency").val();

  // Push a new recommendation to the database using those values
  trainSchedule.push({
    "name": name,
    "destination": destination,
    "time": time,
    "frequency": frequency
  });
};

// Get the single most recent recommendation from the database and
// update the table with its values. This is called every time the child_added
// event is triggered on the trainSchedule Firebase reference, which means
// that this will update EVEN IF you don't refresh the page. Magic.
trainSchedule.on('child_added', function(childSnapshot) {
  // Get the recommendation data from the most recent snapshot of data
  // added to the trainSchedule list in Firebase
  schedule = childSnapshot.val();
console.log(schedule);
  // Update the HTML to display the recommendation text
  // $("#t-name").html(schedule.name)
  // $("#t-destination").html(schedule.destination)
  // $("#t-freq").html(schedule.time)
  // $("#t-mins").html(schedule.frequency)

  $('#trainTable tr:last').after('<tr><td id="t-name">'+ schedule.name +'</td><td id="t-destination">' + schedule.destination + '</td><td id="t-freq">' + schedule.frequency + '</td><td id="t-arrive">' + schedule.time + '</td><td id="t-mins">???</td></tr>');

});

// When the window is fully loaded, call this function.
// Note: because we are attaching an event listener to a particular HTML element
// in this function, we can't do that until the HTML element in question has
// been loaded. Otherwise, we're attaching our listener to nothing, and no code
// will run when the submit button is clicked.
$(window).load(function () {

  // Find the HTML element with the id trainScheduleForm, and when the submit
  // event is triggered on that element, call submitTrainSchedule.
  $("#trainScheduleForm").submit(submitTrainSchedule);

});