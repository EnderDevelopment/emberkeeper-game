class FireFuelObjective {
  constructor({ targetSeconds = 120, maxFuelSeconds = 30, burnRate = 1 } = {}) {
    if (!Number.isFinite(targetSeconds) || targetSeconds <= 0) {
      throw new RangeError("targetSeconds must be a positive number.");
    }
    if (!Number.isFinite(maxFuelSeconds) || maxFuelSeconds <= 0) {
      throw new RangeError("maxFuelSeconds must be a positive number.");
    }
    if (!Number.isFinite(burnRate) || burnRate <= 0) {
      throw new RangeError("burnRate must be a positive number.");
    }

    this.targetSeconds = targetSeconds;
    this.maxFuelSeconds = maxFuelSeconds;
    this.burnRate = burnRate;
    this.elapsedSeconds = 0;
    this.fuelSeconds = 0;
    this.firewood = 0;
    this.state = "active";
  }

  addFirewood(count = 1) {
    this.#requireActive();
    if (!Number.isInteger(count) || count <= 0) {
      throw new RangeError("Firewood count must be a positive integer.");
    }
    this.firewood += count;
    return this.getStatus();
  }

  fuelFire(count = 1) {
    this.#requireActive();
    if (!Number.isInteger(count) || count <= 0) {
      throw new RangeError("Firewood count must be a positive integer.");
    }
    if (count > this.firewood) {
      return { ...this.getStatus(), added: 0, message: "Not enough firewood." };
    }

    let added = 0;
    for (let i = 0; i < count; i += 1) {
      if (this.fuelSeconds >= this.maxFuelSeconds) break;
      this.firewood -= 1;
      this.fuelSeconds = Math.min(this.maxFuelSeconds, this.fuelSeconds + 10);
      added += 1;
    }

    return {
      ...this.getStatus(),
      added,
      message: added > 0 ? `Added ${added} piece${added === 1 ? "" : "s"} of firewood.` : "The fire is already fully fueled.",
    };
  }

  update(deltaSeconds) {
    this.#requireActive();
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
      throw new RangeError("deltaSeconds must be a non-negative number.");
    }

    const step = Math.min(deltaSeconds, this.targetSeconds - this.elapsedSeconds);
    this.elapsedSeconds += step;
    this.fuelSeconds = Math.max(0, this.fuelSeconds - step * this.burnRate);

    if (this.elapsedSeconds >= this.targetSeconds) {
      this.state = "won";
    } else if (this.fuelSeconds <= 0) {
      this.state = "lost";
    }

    return this.getStatus();
  }

  getStatus() {
    return {
      state: this.state,
      elapsedSeconds: this.elapsedSeconds,
      remainingSeconds: Math.max(0, this.targetSeconds - this.elapsedSeconds),
      fuelSeconds: this.fuelSeconds,
      firewood: this.firewood,
      fireIntensity: this.fuelSeconds > 0 ? Math.min(1, this.fuelSeconds / this.maxFuelSeconds) : 0,
    };
  }

  #requireActive() {
    if (this.state !== "active") {
      throw new Error(`The objective has ended (${this.state}).`);
    }
  }
}

// Example game loop: call update(deltaSeconds) once per frame.
const objective = new FireFuelObjective({ targetSeconds: 120, maxFuelSeconds: 30 });
objective.addFirewood(3);
objective.fuelFire(1);

// Export the objective for use by a game or runtime.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { FireFuelObjective, objective };
}
