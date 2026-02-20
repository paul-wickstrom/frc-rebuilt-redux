(function () {
  class VictoryRevealController {
    constructor(scene, opts) {
      this.scene = scene;
      this.durationMs = (opts && opts.durationMs) || 5000;
      this.started = false;
      this.outcome = "TIE";
      this.startMs = 0;
      this.visuals = {
        Red: this.createVisualSet(),
        Blue: this.createVisualSet(),
      };
    }

    createVisualSet() {
      return {
        ring: null,
        bannerBg: null,
        bannerText: null,
        active: false,
        style: null,
        text: "",
      };
    }

    ensureVisuals(robotName) {
      const robot = this.getRobot(robotName);
      const v = this.visuals[robotName];
      if (!robot || !v) return null;

      if (!v.ring) {
        v.ring = this.scene.add.graphics().setDepth(35).setVisible(false);
      }
      if (!v.bannerBg) {
        v.bannerBg = this.scene.add.rectangle(0, 0, 220, 44, 0x000000, 0.85)
          .setStrokeStyle(2, 0xffffff, 1)
          .setDepth(36)
          .setVisible(false);
      }
      if (!v.bannerText) {
        v.bannerText = this.scene.add.text(0, 0, "", {
          fontFamily: "monospace",
          fontSize: "24px",
          fontStyle: "bold",
          color: "#ffffff",
        }).setOrigin(0.5, 0.5).setDepth(37).setVisible(false);
      }

      return v;
    }

    getRobot(robotName) {
      if (robotName === "Red") return this.scene.redRobot;
      if (robotName === "Blue") return this.scene.blueRobot;
      return null;
    }

    getStyleFor(robotName, outcome) {
      const redWin = {
        ring: 0xff4c4c,
        bannerBg: 0x650909,
        bannerStroke: 0xff9a9a,
        bannerColor: "#ffe2e2",
        text: "RED WINS",
      };
      const blueWin = {
        ring: 0x4ea1ff,
        bannerBg: 0x0a2955,
        bannerStroke: 0x9fd0ff,
        bannerColor: "#e6f3ff",
        text: "BLUE WINS",
      };
      const tie = {
        ring: 0xffde76,
        bannerBg: 0x3a3a3a,
        bannerStroke: 0xffde76,
        bannerColor: "#fff5d0",
        text: "TIE GAME",
      };

      if (outcome === "TIE") return tie;
      if (outcome === "RED") return robotName === "Red" ? redWin : null;
      if (outcome === "BLUE") return robotName === "Blue" ? blueWin : null;
      return null;
    }

    start(outcome, nowMs) {
      if (this.started) return;

      this.started = true;
      this.outcome = outcome || "TIE";
      this.startMs = nowMs || Date.now();

      this.activateRobot("Red");
      this.activateRobot("Blue");
      this.scatterFuelOffLogo();
      this.update(this.startMs);
    }

    scatterFuelOffLogo() {
      const scene = this.scene;
      const fuels = scene && Array.isArray(scene.fuels) ? scene.fuels : [];
      if (!fuels.length) return;

      const logo = scene.fieldLogo;
      const logoCx = logo ? logo.x : ((scene.fieldRect && scene.fieldRect.x) || (scene.scale.width * 0.5));
      const logoCy = logo ? logo.y : ((scene.fieldRect && scene.fieldRect.y) || (scene.scale.height * 0.5));

      const logoRx = Math.max(60, ((logo && logo.displayWidth) || 220) * 0.55);
      const logoRy = Math.max(40, ((logo && logo.displayHeight) || 140) * 0.55);
      const borderPx = 72;
      const effectRx = logoRx + borderPx;
      const effectRy = logoRy + borderPx;

      const fieldW = (scene.fieldRect && scene.fieldRect.width) || scene.scale.width;
      const fieldH = (scene.fieldRect && scene.fieldRect.height) || scene.scale.height;

      let launched = 0;
      for (const fuel of fuels) {
        if (!fuel || !fuel.body || !fuel.gfx) continue;

        const x = fuel.body.position.x;
        const y = fuel.body.position.y;
        const dx = x - logoCx;
        const dy = y - logoCy;
        const insideLogo =
          ((dx * dx) / (effectRx * effectRx)) + ((dy * dy) / (effectRy * effectRy)) <= 1.0;

        if (!insideLogo) continue;

        let nx = dx;
        let ny = dy;
        const mag = Math.hypot(nx, ny);
        if (mag < 0.001) {
          const a = Math.random() * Math.PI * 2;
          nx = Math.cos(a);
          ny = Math.sin(a);
        } else {
          nx /= mag;
          ny /= mag;
        }

        const pushDist = 180 + Math.random() * 180;
        const tx = Phaser.Math.Clamp(x + nx * pushDist, 12, fieldW - 12);
        const ty = Phaser.Math.Clamp(y + ny * pushDist, 12, fieldH - 12);

        const tracker = {x, y, scale: 1};
        const delayMs = Math.floor(Math.random() * 220);
        const durMs = 700 + Math.floor(Math.random() * 350);

        scene.tweens.add({
          targets: tracker,
          x: tx,
          y: ty,
          scale: 1.45,
          delay: delayMs,
          duration: durMs,
          ease: "Cubic.Out",
          onStart: () => {
            if (fuel.glowG) fuel.glowG.clear();
          },
          onUpdate: () => {
            fuel.gfx.x = tracker.x;
            fuel.gfx.y = tracker.y;
            fuel.gfx.setScale(tracker.scale);
            scene.matter.body.setPosition(fuel.body, {x: tracker.x, y: tracker.y});
            scene.matter.body.setVelocity(fuel.body, {x: 0, y: 0});
          },
          onComplete: () => {
            fuel.gfx.setScale(1.0);
          },
        });

        launched += 1;
      }

      if (launched > 0) {
        scene.cameras.main.shake(220, 0.003);
      }
    }

    activateRobot(robotName) {
      const v = this.ensureVisuals(robotName);
      if (!v) return;

      const style = this.getStyleFor(robotName, this.outcome);
      v.style = style;
      v.active = !!style;
      v.text = style ? style.text : "";

      if (!v.active) {
        this.hideRobot(robotName);
        return;
      }

      v.bannerBg.setFillStyle(style.bannerBg, 0.9);
      v.bannerBg.setStrokeStyle(2, style.bannerStroke, 1);
      v.bannerText.setText(v.text).setColor(style.bannerColor);

      v.ring.setVisible(true);
      v.bannerBg.setVisible(true);
      v.bannerText.setVisible(true);
    }

    hideRobot(robotName) {
      const v = this.visuals[robotName];
      if (!v) return;
      if (v.ring) {
        v.ring.clear();
        v.ring.setVisible(false);
      }
      if (v.bannerBg) v.bannerBg.setVisible(false);
      if (v.bannerText) v.bannerText.setVisible(false);
      v.active = false;
    }

    update(nowMs) {
      if (!this.started) return;

      const now = nowMs || Date.now();
      const elapsed = now - this.startMs;
      const pulseSpeed = 0.012;
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * pulseSpeed);
      const holdStatic = elapsed > this.durationMs;

      this.updateRobot("Red", pulse, holdStatic);
      this.updateRobot("Blue", pulse, holdStatic);
    }

    updateRobot(robotName, pulse, holdStatic) {
      const robot = this.getRobot(robotName);
      const v = this.visuals[robotName];
      if (!robot || !v || !v.active || !v.style) return;

      const x = robot.body.position.x;
      const y = robot.body.position.y;

      const alpha = holdStatic ? 0.55 : (0.35 + pulse * 0.45);
      const lineW = holdStatic ? 3 : (2 + pulse * 3);

      v.ring.clear();
      v.ring.lineStyle(lineW, v.style.ring, alpha);
      v.ring.strokeCircle(x, y, 42);
      v.ring.lineStyle(1.5, v.style.ring, Math.min(1, alpha + 0.15));
      v.ring.strokeCircle(x, y, 49);

      const bannerY = y + 82;
      v.bannerBg.setPosition(x, bannerY);
      v.bannerText.setPosition(x, bannerY + 0.5);
    }

    reset() {
      this.started = false;
      this.outcome = "TIE";
      this.startMs = 0;

      this.hideRobot("Red");
      this.hideRobot("Blue");
    }
  }

  window.VictoryRevealController = VictoryRevealController;
})();
