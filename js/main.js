// js/main.js

// Grab full window size for initial config
const GAME_WIDTH  = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',             // inject canvas into this div
  scale: {
    mode: Phaser.Scale.RESIZE,          // adapt game size to container
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  backgroundColor: '#87CEEB',           // sky-blue background
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let ship;
let cursors;
let islands;
let crystals;
let score = 0;
let scoreText;

function preload() {
  // Placeholder assets – swap these out for your own high-quality art/audio
  this.load.image('ship',    'assets/ship.png');
  this.load.image('crystal', 'assets/crystal.png');
  this.load.audio('collect', 'assets/audio/collect.wav');
}

function create() {
  // Procedural islands group
  islands = this.physics.add.staticGroup();
  spawnIsland(this);

  // Crystals group
  crystals = this.physics.add.group();
  spawnCrystal(this);

  // Player ship sprite
  ship = this.physics.add.sprite(100, this.scale.height / 2, 'ship')
               .setScale(0.5)
               .setCollideWorldBounds(true);

  // Input setup
  cursors = this.input.keyboard.createCursorKeys();

  // Collisions & overlaps
  this.physics.add.collider(ship, islands, hitIsland, null, this);
  this.physics.add.overlap(ship, crystals, collectCrystal, null, this);

  // UI text
  scoreText = this.add.text(16, 16, 'Crystals: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  }).setScrollFactor(0);

  // Audio
  this.collectSound = this.sound.add('collect');
}

function update(time, delta) {
  // Ship movement
  ship.setVelocity(0);
  if (cursors.up.isDown)    ship.setVelocityY(-200);
  if (cursors.down.isDown)  ship.setVelocityY(200);
  if (cursors.left.isDown)  ship.setVelocityX(-200);
  if (cursors.right.isDown) ship.setVelocityX(200);

  // Scroll islands left and respawn off-screen ones
  islands.getChildren().forEach(isle => {
    isle.x -= 2;
    isle.refreshBody();
    if (isle.x < - (isle.width / 2)) {
      isle.destroy();
      spawnIsland(this);
    }
  });

  // Scroll crystals similarly
  crystals.getChildren().forEach(cr => {
    cr.x -= 2;
    if (cr.x < -50) {
      cr.destroy();
      spawnCrystal(this);
    }
  });
}

// Spawn a simple rectangular island at a random vertical position
function spawnIsland(scene) {
  const width  = Phaser.Math.Between(100, 300);
  const height = Phaser.Math.Between(20, 60);
  const x = scene.scale.width + width / 2;
  const y = Phaser.Math.Between(200, scene.scale.height - 100);

  const isle = scene.add.rectangle(x, y, width, height, 0x8B4513);
  scene.physics.add.existing(isle, true);
  islands.add(isle);
}

// Spawn a crystal collectible off-screen to the right
function spawnCrystal(scene) {
  const x = scene.scale.width + Phaser.Math.Between(50, 400);
  const y = Phaser.Math.Between(50, scene.scale.height - 50);

  const cr = crystals.create(x, y, 'crystal')
                     .setScale(0.3)
                     .refreshBody();
  cr.body.setAllowGravity(false);
}

// Handle collision with an island (game over)
function hitIsland(ship, isle) {
  this.physics.pause();
  this.add.text(
    game.scale.width  / 2 - 100,
    game.scale.height / 2 - 24,
    'Game Over',
    { fontSize: '48px', fill: '#ff0000' }
  );
}

// Handle collecting a crystal
function collectCrystal(ship, crystal) {
  crystal.destroy();
  score += 1;
  scoreText.setText('Crystals: ' + score);
  this.collectSound.play();
}

// Ensure Phaser resizes its internal canvas when the window changes
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});
