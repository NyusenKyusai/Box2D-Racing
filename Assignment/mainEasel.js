// Importing the mouse and keyboard handles as well as the EaselJS Implementation Class
import * as handlers from "./components/eventHandlers.js";
//import LoZGame from "./components/gameLogic.js";
import { EaselGame } from "./components/gameLogic.js";

// let mygame = new LoZGame(600, 1800, 30, 0, 9.81, 60, "b2dcan");
// mygame.setupDebugDraw();
// mygame.getData("./components/gameData.json", 1);

// mygame.addKeyboardHandler("keydown", mygame.handleKeyDown);
// mygame.addKeyboardHandler("keyup", mygame.handleKeyUp);

// Calling the EaselJS class and setting it to a variable with on the b2dcan canvas
let mygame2 = new EaselGame(600, 1800, 30, 0, 9.81, 60, "b2dcan");
// Calling the setupDebugDraw method
mygame2.setupDebugDraw();
// Getting the data and creating the world bodies for level 1
mygame2.getData("./components/gameData.json", 1);
// Adding the keydown, keyup, and mousedown events
mygame2.addKeyboardHandler("keydown", mygame2.handleKeyDown);
mygame2.addKeyboardHandler("keyup", mygame2.handleKeyUp);
mygame2.addMouseHandler(
  // Setting the target of the mouseclick to the b2can
  document.getElementById("b2dcan"),
  "mousedown",
  mygame2.handleMouseDown
);

// Setting LoZ contact to the b2Listener
let LoZContact = handlers.b2Listener;

// Calling PostSolve to handle collisions
LoZContact.PostSolve = (contact, impulse) => {
  // Getting Fixture A and Fixture B's userdata
  let fixA = contact.GetFixtureA().GetBody().GetUserData();
  let fixB = contact.GetFixtureB().GetBody().GetUserData();

  // Initialising the variables that will be holding the bodies and fixtures that collided
  let isPlayer = false;
  let otherCollision = false;
  let enemyUserData = false;
  let playerUserData;

  // If statement that runs code if fixture A is a player and fixture B is a dynamic body
  if (fixA.id == "player" && !mygame2.collisionList.includes(fixB.id)) {
    // Sets isPlayer to FixtureA
    isPlayer = contact.GetFixtureA();
    // Sets otherCollision to FixtureB
    otherCollision = contact.GetFixtureB();
    // Takes the itemlist from mygame and iterates over each entry in the array
    mygame2.itemList.forEach((item) => {
      // If the unique name of the item is the same as the player
      if (item.userdata.uniquename == fixA.uniquename) {
        // Sets playerUserData to the item
        playerUserData = item;
      }

      // If the unique name of the item is the same as the enemy
      if (item.userdata.uniquename == fixB.uniquename) {
        // Sets enemyUserData to the item
        enemyUserData = item;
      }
    });
  }

  // If statement that runs code if fixture B is a player and fixture A is a dynamic body
  if (fixB.id == "player" && !mygame2.collisionList.includes(fixA.id)) {
    // Sets otherCollision to FixtureA
    otherCollision = contact.GetFixtureA();
    // Sets isPlayer to FixtureB
    isPlayer = contact.GetFixtureB();
    // Takes the itemlist from mygame and iterates over each entry in the array
    mygame2.itemList.forEach((item) => {
      // If the unique name of the item is the same as the player
      if (item.userdata.uniquename == fixB.uniquename) {
        // Sets playerUserData to the item
        playerUserData = item;
      }

      // If the unique name of the item is the same as the enemy
      if (item.userdata.uniquename == fixA.uniquename) {
        // Sets enemyUserData to the item
        enemyUserData = item;
      }
    });
  }

  // If statement that runs code if the player collides with a sensor
  if (fixA.id == "player" && fixB.id == "sensor") {
    // Iterates over the item list and destroys every body
    mygame2.itemList.forEach((item) => {
      mygame2.destroylist.push(item.GetBody());
    });

    // Sets the itemlist to an empty array
    mygame2.itemList = [];

    // Calls the spawn method to determine which sensor was collided and get the data from the correct objects
    mygame2.spawn(fixB.uniquename);
    //mygame.getData("./components/gameData.json", 2);
  }

  // If statement that runs code if the player collides with a sensor
  if (fixB.id == "player" && fixA.id == "sensor") {
    // Iterates over the item list and destroys every body
    mygame2.itemList.forEach((item) => {
      mygame2.destroylist.push(item.GetBody());
    });

    // Sets the itemlist to an empty array
    mygame2.itemList = [];

    // Calls the spawn method to determine which sensor was collided and get the data from the correct objects
    mygame2.spawn(fixA.uniquename);
    //mygame.getData("./components/gameData.json", 2);
  }

  //console.log(mygame.getInvisible());

  // If statement that runs code if isPlayer exists
  // By extension, the other collision is a enemy not a static body
  if (isPlayer != false) {
    // If statement that determines whether the player is attacking
    if (mygame2.attacking) {
      // Gets the health from the user data of the enemy body
      let enemyHealth = otherCollision.GetBody().GetUserData().health;

      //console.log(enemyHealth);
      // Removes one health from the enemy
      enemyHealth = enemyHealth - 1;

      //console.log(enemyHealth);
      // Gets the distance between the two entities
      let distance = mygame2.getDistance(otherCollision, isPlayer);
      // Determines the direction using the distance
      let direction = mygame2.getDirection(distance);
      // Sets the linear velocity of the enemy to zero
      mygame2.setLinearVelocity(otherCollision, 0, 0);
      // Applies an impulse to the enemy that is away from where they collided with the player
      mygame2.applyImpulse(direction, otherCollision, 10, -25);
      // If the enemy has died
      if (enemyHealth <= 0) {
        // Destroys the enemy
        mygame2.destroylistEnemy.push(enemyUserData.GetBody());
      } else {
        //console.log(enemyUserData);
        // Changes the user data from the enemy to include the current health
        enemyUserData.changeUserData("health", enemyHealth);
      }
      // If statement to determine if the user is in invinsibility frames as well as the impulse is greater than 0
    } else if (!mygame2.getInvisible() && impulse.normalImpulses[0] > 0) {
      // Gets the current health of the player
      let currentHealth = isPlayer.GetBody().GetUserData().health;
      // Removes one from the current health
      currentHealth = currentHealth - 1;

      //console.log(otherCollision.GetBody());

      // The user is set to invinsible and is not allowed to move to allow for the impulse to finish
      mygame2.setInvisible(true);
      mygame2.setAllowMove(false);

      // Distance and direction method calls to determine the direction of the impulse
      let distance = mygame2.getDistance(isPlayer, otherCollision);
      let direction = mygame2.getDirection(distance);

      //console.log(direction);

      // Setting the player's linear velocity to 0
      mygame2.setLinearVelocity(isPlayer, 0, 0);

      // Applying the impulse to the player
      mygame2.applyImpulse(direction, isPlayer, 10, -25);

      // Setting the Invisibility frames interval
      setInterval(function () {
        // Setting invinsible to false
        mygame2.setInvisible(false);
      }, 1000);

      // Setting the AllowMove interval
      setInterval(function () {
        // Allowing the user to control the player
        mygame2.setAllowMove(true);
      }, 300);

      // If statement to determine whether the user has lost or not
      if (currentHealth <= 0) {
        // Redirected to the gameOver screen if they have lost
        window.location.href = "gameOver.php";
      } else {
        // Changing the user's health in userdata to the current health
        playerUserData.changeUserData("health", currentHealth);
      }
    }
  }
};

// Setting the contact listener of the world object to LoZContact
mygame2.world.SetContactListener(LoZContact);
