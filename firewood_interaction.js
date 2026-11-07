const { FireFuelObjective } = require("./fire_objective");

class FirewoodInteraction {
  constructor({ objective, player, pickupRange = 2.5 } = {}) {
    if (!(objective instanceof FireFuelObjective)) {
      throw new TypeError("objective must be a FireFuelObjective instance.");
    }
    if (!player || typeof player !== "object") {
      throw new TypeError("player must be an object.");
    }
    if (!Number.isFinite(pickupRange) || pickupRange <= 0) {
      throw new RangeError("pickupRange must be a positive number.");
    }

    this.objective = objective;
    this.player = player;
    this.pickupRange = pickupRange;
  }

  collectFirewood(source, amount = 1) {
    this.#requireSource(source);
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new RangeError("amount must be a positive integer.");
    }
    if (source.remaining < amount) {
      return this.#result(false, "There is not enough firewood at this source.");
    }

    source.remaining -= amount;
    this.player.firewood = (this.player.firewood || 0) + amount;
    this.objective.addFirewood(amount);

    return this.#result(true, `Collected ${amount} piece${amount === 1 ? "" : "s"} of firewood.`);
  }

  collectNearbyFirewood(sources, amount = 1) {
    if (!Array.isArray(sources)) {
      throw new TypeError("sources must be an array.");
    }

    const source = sources.find((candidate) => {
      try {
        this.#requireSource(candidate);
        return this.#distanceTo(candidate) <= this.pickupRange && candidate.remaining >= amount;
      } catch {
        return false;
      }
    });

    if (!source) {
      return this.#result(false, "No reachable firewood is available.");
    }
    return this.collectFirewood(source, amount);
  }

  fuelFire(amount = 1) {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new RangeError("amount must be a positive integer.");
    }
    const before = this.objective.getStatus().firewood;
    const result = this.objective.fuelFire(Math.min(amount, this.player.firewood || 0));
    const used = before - result.firewood;
    this.player.firewood = Math.max(0, (this.player.firewood || 0) - used);
    return { ...result, used };
  }

  #requireSource(source) {
    if (!source || typeof source !== "object") {
      throw new TypeError("source must be an object.");
    }
    if (!Number.isFinite(source.x) || !Number.isFinite(source.y) || !Number.isInteger(source.remaining) || source.remaining < 0) {
      throw new TypeError("source must contain numeric x and y values and a non-negative integer remaining count.");
    }
  }

  #distanceTo(source) {
    if (!this.player.position || typeof this.player.position !== "object") {
      throw new TypeError("player.position must contain x and y values.");
    }
    const dx = source.x - this.player.position.x;
    const dy = source.y - this.player.position.y;
    return Math.hypot(dx, dy);
  }

  #result(success, message) {
    return {
      success,
      message,
      firewood: this.player.firewood || 0,
      objective: this.objective.getStatus(),
    };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { FirewoodInteraction };
}
