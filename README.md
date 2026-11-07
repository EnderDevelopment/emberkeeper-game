# JavaScript Game Objective: Emberkeeper Objective

Emberkeeper Objective is a lightweight JavaScript game objective for keeping a fire burning with firewood. It provides fire-fueling objective logic, burn timing, win/loss states, fire-intensity status, and optional proximity-based firewood collection.

## Install

1. Place `fire_objective.js` and `firewood_interaction.js` in the same directory.
2. Use them from a Node.js project with CommonJS. No additional dependencies are required.

## Use

Create and fuel the objective, then call `update(deltaSeconds)` from your game loop:

```js
const { FireFuelObjective } = require("./fire_objective");

const objective = new FireFuelObjective({
  targetSeconds: 120,
  maxFuelSeconds: 30,
});

objective.addFirewood(3);
console.log(objective.fuelFire(1));

function gameUpdate(deltaSeconds) {
  const status = objective.update(deltaSeconds);
  console.log(status.state, status.fireIntensity);
}
```

Each piece of firewood adds up to 10 seconds of fuel, capped by `maxFuelSeconds`. Check the returned status for the objective state, remaining time, fuel, firewood, and fire intensity.

To add nearby firewood collection, create a player and interaction handler:

```js
const { FireFuelObjective } = require("./fire_objective");
const { FirewoodInteraction } = require("./firewood_interaction");

const objective = new FireFuelObjective();
const player = { position: { x: 0, y: 0 }, firewood: 0 };
const interaction = new FirewoodInteraction({ objective, player });

const sources = [{ x: 1, y: 0, remaining: 5 }];
console.log(interaction.collectNearbyFirewood(sources, 1));
console.log(interaction.fuelFire(1));
```

Call `update(deltaSeconds)` to advance the objective and determine whether it is won or lost.

---

More open source project projects by EnderDevelopment: https://github.com/EnderDevelopment

Project page: https://dash.enderdevelopment.com/community/4bf28945-eda9-4439-9e70-ce8f0a42ae57?utm_source=github&utm_medium=readme&utm_campaign=auto_publish&utm_content=4bf28945-eda9-4439-9e70-ce8f0a42ae57
