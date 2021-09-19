"use strict";

/****
 * BOX2DWEB Definitions
 */

let b2Vec2 = Box2D.Common.Math.b2Vec2;
let b2BodyDef = Box2D.Dynamics.b2BodyDef;
let b2Body = Box2D.Dynamics.b2Body;
let b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
let b2Fixture = Box2D.Dynamics.b2Fixture;
let b2World = Box2D.Dynamics.b2World;
let b2MassData = Box2D.Collision.Shapes.b2MassData;
let b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
let b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
let b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

/*****
 * Objects for Destruction
 */

let destroyList = []; // Empty list at start

/*****
 * Define Canvas and World
 */

let WIDTH = 800;
let HEIGHT = 600;
let SCALE = 30;

let world = new b2World(new b2Vec2(0, 9.81), true);

/*****
 * Utility Functions & Objects
 */

let defineNewBody = (
  density,
  friction,
  restitution,
  x,
  y,
  width,
  height,
  objID,
  objectType
) => {
  let fixDef = new b2FixtureDef();
  fixDef.density = density;
  fixDef.friction = friction;
  fixDef.restitution = restitution;
  let bodyDef = new b2BodyDef();

  if (objectType == "static") {
    bodyDef.type = b2Body.b2_staticBody;
  } else if (objectType == "dynamic") {
    bodyDef.type = b2Body.b2_dynamicBody;
  }
  bodyDef.position.x = x / SCALE;
  bodyDef.position.y = y / SCALE;
  fixDef.shape = new b2PolygonShape();
  fixDef.shape.SetAsBox(width / SCALE, height / SCALE);
  let thisobj = world.CreateBody(bodyDef).CreateFixture(fixDef);
  thisobj.GetBody().SetUserData({ id: objID });
  return thisobj;
};

let defineNewCircle = (density, friction, restitution, x, y, r, objID) => {
  let fixDef = new b2FixtureDef();
  fixDef.density = density;
  fixDef.friction = friction;
  fixDef.restitution = restitution;
  let bodyDef = new b2BodyDef();
  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.x = x / SCALE;
  bodyDef.position.y = y / SCALE;
  fixDef.shape = new b2CircleShape(r / SCALE);
  let thisobj = world.CreateBody(bodyDef).CreateFixture(fixDef);
  thisobj.GetBody().SetUserData({ id: objID });
  return thisobj;
};

/*****
 * Our World Objects
 */

// Static
let ground = defineNewBody(
  1.0,
  0.5,
  0.2,
  WIDTH / 2,
  HEIGHT,
  WIDTH / 2,
  5,
  "ground",
  "static"
);

let leftWall = defineNewBody(
  1.0,
  0.5,
  0.2,
  5,
  HEIGHT,
  5,
  HEIGHT,
  "leftWall",
  "static"
);

let tightWall = defineNewBody(
  1.0,
  0.5,
  0.2,
  WIDTH - 5,
  HEIGHT,
  5,
  HEIGHT,
  "rightWall",
  "static"
);

// Dynamic

let myBox = defineNewBody(1.0, 1.0, 0.2, 200, 200, 50, 50, "aBox", "dynamic");

let myCircle = defineNewCircle(1.0, 1.0, 0.8, 400, 250, 30, "aCircle");
let myCircle2 = defineNewCircle(1.0, 1.0, 0.8, 385, 140, 30, "bCircle");

/*
Debug Draw
*/

let debugDraw = new b2DebugDraw();
debugDraw.SetSprite(document.getElementById("b2dcan").getContext("2d"));
debugDraw.SetDrawScale(SCALE);
debugDraw.SetFillAlpha(0.3);
debugDraw.SetLineThickness(1.0);
debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
world.SetDebugDraw(debugDraw);

// Update World Loop

let update = () => {
  world.Step(1 / 60, 10, 10);
  world.DrawDebugData();
  world.ClearForces();

  for (let i in destroyList) {
    world.DestroyBody(destroyList[i]);
  }
  destroyList.length = 0;

  window.requestAnimationFrame(update);
};

window.requestAnimationFrame(update);

/*****
 * Listeners
 */

// prettier-ignore
var listener = new Box2D.Dynamics.b2ContactListener;
listener.BeginContact = function (contact) {
  console.log("Begin Contact:" + contact.GetFixtureA().GetBody().GetUserData());
};
listener.EndContact = function (contact) {
  console.log("End Contact:" + contact.GetFixtureA().GetBody().GetUserData());
};
listener.PostSolve = function (contact, impulse) {
  let fixA = contact.GetFixtureA().GetBody().GetUserData().id;
  let fixB = contact.GetFixtureB().GetBody().GetUserData().id;

  console.log(
    fixA + " hits " + fixB + "with impulse " + impulse.normalImpulses[0]
  );
};
listener.PreSolve = function (contact, oldManifold) {};
world.SetContactListener(listener);
