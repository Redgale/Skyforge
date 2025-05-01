// js/main.js

class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    // Swap these with your high-quality assets when you have them
    this.load.image('ship',    'assets/ship.png');
    this.load.image('crystal', 'assets/crystal.png');
    this.load.audio('collect', 'assets/audio/collect.wav');
  }

  create() {
    console.log('MainScene.create()');

    // Create our groups
    this.islands = this.physics.add.staticGroup();
    this.crystals = this.physics.add.group();

    // Spawn one on-screen island & crystal so you see something immediately
    this.spawnIsland(true);
    this.spawnCrystal(true);

    // Also queue up a few off-screen spawns for continuous play
    for (let i = 0; i < 3; i++) {
      this.spawnIsland(false);
      this.spawnCrystal(false);
    }

    // Add the player ship
    this.ship = this.physics.add
      .sprite(100, this.scale.height / 2, 'ship')
      .setScale(0.5)
      .setCollideWorldBounds(true)
      .setDepth(1);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Collisions & Overlaps
    this.physics.add.collider(this.ship, this.islands, this.hitIsland, null, this);
    this.physics.add.overlap(this.ship, this.crystals, this.collectCrystal, null, this);

    // UI
    this.score = 0;
    this.scoreText = this.add
      .text(16, 16, 'Crystals: 0', { fontSize: '24px', fill: '#ffffff' })
      .setScrollFactor(0);

    // Audio
    this.collectSound = this.sound.add('collect');
  }

  update() {
    // Reset velocity
    this.ship.setVelocity(0);

    // Ship movement
    if (this.cursors.up.isDown)    this.ship.setVelocityY(-200);
    if (this.cursors.down.isDown)  this.ship.setVelocityY(200);
    if (this.cursors.left.isDown)  this.ship.setVelocityX(-200);
    if (this.cursors.right.isDown) this.ship.setVelocityX(200);

    // Scroll islands and respawn when off-screen
    this.islands.getChildren().forEach(isle => {
      isle.x -= 2;
      isle.refreshBody();
      if (isle.x < - (isle.width / 2)) {
        isle.destroy();
        this.spawnIsland(false);
      }
    });

    // Scroll crystals and respawn
    this.crystals.getChildren().forEach(cr => {
      cr.x -= 2;
      if (cr.x < -50) {
        cr.destroy();
        this.spawnCrystal(false);
      }
    });
  }

  // initial=true places in view; false sends off-screen to the right
  spawnIsland(initial) {
    const w = Phaser.Math.Between(100, 300);
    const h = Phaser.Math.Between(20, 60);
    const x = initial
      ? Phaser.Math.Between(w / 2, this.scale.width - w / 2)
      : this.scale.width + w / 2;
    const y = Phaser.Math.Between(200, this.scale.height - 100);

    const isle = this.add.rectangle(x, y, w, h, 0x8B4513);
    this.physics.add.existing(isle, true);
    this.islands.add(isle);
  }

  spawnCrystal(initial) {
    const x = initial
      ? Phaser.Math.Between(100, this.scale.width - 100)
      : this.scale.width + Phaser.Math.Between(50, 400);
    const y = Phaser.Math.Between(50, this.scale.height - 50);

    const cr = this.crystals.create(x, y, 'crystal').setScale(0.3).refreshBody();
    cr.body.setAllowGravity(false);
  }

  hitIsland(ship, isle) {
    this.physics.pause();
    this.add.text(
      this.scale.width  / 2 - 100,
      this.scale.height / 2 - 24,
      'Game Over',
      { fontSize: '48px', fill: '#ff0000' }
    );
  }

  collectCrystal(ship, crystal) {
    crystal.destroy();
    this.score += 1;
    this.scoreText.setText('Crystals: ' + this.score);
    this.collectSound.play();
  }
}

window.onload = () => {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-container',             // make sure your index.html has <div id="game-container"></div>
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: window.innerWidth,
      height: window.innerHeight
    },
    backgroundColor: '#87CEEB',
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [MainScene]
  });

  // Keep canvas in sync if the user resizes the window
  window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });
};
