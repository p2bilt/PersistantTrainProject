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

// Reference to the trainSchedule object in your Firebase editDatabase
var trainSchedule = firebase.database().ref("trainSchedule");

// investigate if this is redundant... it seems like it
var trainScheduleChild = firebase.database().ref().child("trainSchedule");

// Save a new recommendation to the editDatabase, using the input in the form
var submitTrainSchedule = function() {

	// don't allow dopes to enter empty form
    event.preventDefault();

    // Get input values from each of the form elements
    var key = $('#key').val();
    var tname = $("#train-name").val().trim();
    var tdestination = $("#train-destination").val().trim();
    var ttime = $("#train-time").val().trim();
    var tfrequency = $("#train-frequency").val().trim();

	// if key exists, try and update the info instead of a new submission.
    if (key) {

    var itemToEdit = trainScheduleChild.child(key);

    itemToEdit.update({ name : tname });
    itemToEdit.update({ destination : tdestination });
    itemToEdit.update({ time : ttime });
    itemToEdit.update({ frequency : tfrequency })

    // feedback if it worked nicely, or didn't
        .then(function() {
            console.log("Edit succeeded.");
        })

        .catch(function(error) {
            console.log("Edit failed: " + error.message);
        });

    // rewrite class (colors) of form panel in 'edit' mode back to 'normal' mode
    $("#addPanel").removeClass("panel-danger").addClass("panel-info");
    $("#addButton").removeClass("btn-success").addClass("btn-primary");
    $("#addPanelTitle").html("Add Train");

    } else 

    // if key doesn't exist, that means it's a new entry: therefore submit to firebase
    {
    // Push a new recommendation to the Database using those values
    trainSchedule.push({
        "name": tname,
        "destination": tdestination,
        "time": ttime,
        "frequency": tfrequency
    });

    }

    // resent the form to blank, default values
    $('#trainScheduleForm')[0].reset();

};


// Get the entries from the firebase and update the table with its values. 
// why is child_added triggered on page load? Glad it does, but we may never know.
trainSchedule.on('child_added', function(childSnapshot) {
	// get child data, cram into variable
    var schedule = childSnapshot.val();
    // get key id for data child
    var id = childSnapshot.key;
    // trigger the function to place row of data on screen, pass in data and key
    scheduleBuilder(schedule, id);
});


// listen for an edited child in firebase, rebuild the table row if triggered
trainSchedule.on('child_changed', function(childSnapshot) {
   	// get child data, cram into variable
   	var edited = childSnapshot.val();
   	// get key id for data child
   	var id = childSnapshot.key;
   	// delete the old 
   	$('#'+id).remove();
   	// trigger the function to place row of data on screen, pass in data and key
	scheduleBuilder(edited, id);   
});


// function that builds table rows and calculates 'next arrival' and 'minutes away', inserts them on to page
function scheduleBuilder(schedule, id) {

	// var schedule = schedData;

	 // Gets the current time
    var now = new Date();

    // add seconds to standardize 
    var departString = (schedule.time + ":00");

    // slice apart and put into an array
    var departTime = departString.split(':');

    // create a Date Object to use & abouse
    var firstDeparture = new Date(); 

    // reset the time in Date Object with array of inital departure time
    firstDeparture.setHours(+departTime[0]);
    firstDeparture.setMinutes(departTime[1]);
    firstDeparture.setSeconds(departTime[2]);

    // trim and edit the timedate into a legible AM/PM format
    var firstDepartShort = firstDeparture.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });    

    // build table row. Yes, I know it's ugly. place it after the previous table row.
    $('#trainTable tr:last').after('<tr id="' + id + '"><td class="t-name">' + schedule.name +
        '</td><td class="t-destination">' + schedule.destination +
        '</td><td class="t-firstDepart text-center">' + firstDepartShort +
        '</td><td class="t-freq text-center">' + schedule.frequency +
        '</td><td class="t-arrive text-center" id="t-arrive' + id + '"></td><td class="t-mins text-center" id="t-mins' + id +
        '">???</td><td class="t-del text-center"><span key="' + id +
        '" class="deleteMe"><i class="fa fa-trash" aria-hidden="true"></i></span></td><td class="t-edit text-center"><span key="' + id +
        '" class="editMe"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></span></td></tr>');


    // departure times are always treated as though they are today's date.
    // is the departure time in the future or the past? different code depending.

    if (firstDeparture > now)
    // subtract current time from departure time and print to screen
    {
    	// This gives difference in milliseconds
        var difference = firstDeparture.getTime() - now.getTime(); 
        // convert milliseconds to minutes
        var resultInMinutes = Math.round(difference / 60000);
        // print minutes result to page
        $("#t-mins" + id).html(resultInMinutes);
        // print arrival time to page
        $("#t-arrive" + id).html(firstDeparture.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }));

    } else
        // loop thru adding interval to current time until it exceeds it. print to screen
    {
    	// variable to be iteratively added to (departure time plus frequency interval)
        var departurePlus = firstDeparture;
        // string to integer, is it needed?
        var interval = parseInt(schedule.frequency, 10);
        // keep looping until exceeds current time
        while (now > departurePlus) {
            departurePlus.setMinutes(departurePlus.getMinutes() + interval);
        }
        // then, do calculations that will give you minutes until new arrival time, results in milliseconds
        var differencePlus = departurePlus.getTime() - now.getTime();
		// convert milliseconds to minutes
        var resultInMins = Math.round(differencePlus / 60000);
		// print minutes result to page
	    $("#t-mins" + id).html(resultInMins);
	    // print arrival time to page
        $("#t-arrive" + id).html(departurePlus.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }));

    }
}


	// When the window is fully loaded, enable this listener
$(window).load(function() {

    // Find the HTML element with the id trainScheduleForm, and when the submit
    // event is triggered on that element, call function submitTrainSchedule.
    $("#trainScheduleForm").submit(submitTrainSchedule);

});


	// click handler EDIT function - when element with class "editme" is clicked, begin an editing function
$(document).on('click', ".editMe", function() {
	// retrieve the firebase key value of the element clicked
    var key = $(this).attr('key');
    // location of firebase db child we're editing
    var itemToEdit = trainScheduleChild.child(key);
    // retrieve data from firebase in order to populate the form. 
    // I now realize I probably could have skipped the firebase, and just populated form extracting data w/ jquery...
    itemToEdit.on('value', function(childSnapshot) {

        var editData = childSnapshot.val();

        var name = editData.name;
        var destination = editData.destination;
        var time = editData.time;
        var frequency = editData.frequency;
        // jquery populate the form w/ firebase specific child data
        $('#train-name').val(name);
        $('#train-destination').val(destination);
        $('#train-time').val(time);
        $('#train-frequency').val(frequency);
        $('#key').val(key);
    });
    // edit class on some page elements to reinforce that we're in 'edit mode'
    $("#addPanel").removeClass("panel-info").addClass("panel-danger");
    $("#addButton").removeClass("btn-primary").addClass("btn-success");
    $("#addPanelTitle").html("EDIT TRAIN SCHEDULE");

});

// should also build a "cancel" button into the edit field, to kick back to normal mode w/o edit.

// click handler to DELETE firebase entry. listen for click on class 'deleteMe' to trigger
$(document).on('click', ".deleteMe", function() {

    var key = $(this).attr('key');

    var itemToRemove = trainScheduleChild.child(key);

    itemToRemove.remove()

        .then(function() { 
            console.log("Remove succeeded.");
        })

        .catch(function(error) {
            console.log("Remove failed: " + error.message);
        });

});

// make sure the row is removed, even if it's deleted on editDatabase side
trainScheduleChild.on('child_removed', function(snap) {
    var key = snap.key;
    $('#' + key).remove();
});

// generate onscreen clock
function startTime() {
    var today = new Date(),
        h = checkTime(today.getHours()),
        m = checkTime(today.getMinutes()),
        s = checkTime(today.getSeconds());
    $('#time').html("Current Time: " + h + ":" + m + ":" + s);
    t = setTimeout(function() {
        startTime();
    }, 500);
}

// for onscreen clock, pop a zero in front of single digits
function checkTime(i) {
    return (i < 10) ? "0" + i : i;
}

startTime();
