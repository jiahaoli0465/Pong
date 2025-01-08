const BOARD_WIDTH = 500;
const BOARD_HEIGHT = 400;

const CONTROL_HEIGHT = 80;
const CONTROL_WIDTH = 15;

const tickRegion = [220, 280];

const Board = document.querySelector('#board');

const P1 = document.querySelector('#p1');
const P2 = document.querySelector('#p2');

const Ball = document.querySelector('#ball');
const startGameBtn = document.querySelector('#startgame');

const endGameBtn = document.querySelector('#endgame');

const gameCondition = document.querySelector('#gameCondition');

const maxSpeed = 4;

const p1Goal = 0;

const p2Goal = BOARD_WIDTH;

let GAME_CONDITION;

let teleportCooldown = 0; //ticks

let tick = 0;

const commands = {
  up1: false,
  down1: false,
  up2: false,
  down2: false,
};

document.addEventListener('keydown', (event) => {
  if (event.key == 's') {
    commands.down1 = true;
  }
  if (event.key == 'w') {
    commands.up1 = true;
  }

  if (event.key == 'l') {
    commands.down2 = true;
  }
  if (event.key == 'p') {
    commands.up2 = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key == 's') {
    commands.down1 = false;
  }
  if (event.key == 'w') {
    commands.up1 = false;
  }

  if (event.key == 'l') {
    commands.down2 = false;
  }
  if (event.key == 'p') {
    commands.up2 = false;
  }
});

const startGame = async () => {
  const control1 = {
    element: P1,
    height: 80,
    positionY: 160,
    positionX: 20,
  };

  const control2 = {
    element: P2,
    height: 80,
    positionX: 455,
    positionY: 160,
  };

  const ball = {
    element: Ball,
    positionY: 185,
    positionX: 235,
    height: 30,
    width: 30,
  };

  const teleporter1 = {
    element: null,
    positionY: null,
    positionX: null,
    height: 70,
    width: 15,
  };

  const teleporter2 = {
    element: null,
    positionY: null,
    positionX: null,
    height: 70,
    width: 15,
  };

  const updatePlayer = (control, y) => {
    const res = control.positionY + y;
    // console.log(res);
    if (0 < res && res < 320) {
      control.positionY = control.positionY + y;

      control.element.style.top = `${control.positionY}px`;
      control.element.style.left = `${control.positionX}px`;
    }
  };

  const init = Math.random(0, 1) * 2 - 1;

  let x_speed = init > 0 ? init + 0.5 : -0.5;
  let y_speed = Math.random(0, 1) * 2 - 1;

  const calculate_position = () => {
    return [ball.positionX + x_speed, ball.positionY + y_speed];
  };

  const validateBall = (position) => {
    if (position[0] < 0) {
      GAME_CONDITION = 'p2 win';
      return false;
    } else if (position[0] > 470) {
      GAME_CONDITION = 'p1 win';
      return false;
    } else if (position[1] > 370) {
      y_speed = -1 * y_speed;
      return false;
    } else if (position[1] < 0) {
      y_speed = -1 * y_speed;
      return false;
    }

    return true;
  };

  const bounceBall = () => {
    const leftBoundLow = control1.positionY;
    const leftBoundHigh = control1.positionY + control1.height;

    const rightBoundLow = control2.positionY;
    const rightBoundHigh = control2.positionY + control2.height;

    const centerOfBall = ball.positionY + 15;

    const leftDistance = control1.positionX;

    const rightDistance = control2.positionX;

    if (ball.positionX < leftDistance + 15) {
      //   console.log('in area');
      if (leftBoundLow < centerOfBall && centerOfBall < leftBoundHigh) {
        if (x_speed > 0) {
          return;
        }

        x_speed = -1.5 * x_speed;
        x_speed =
          Math.abs(x_speed) > maxSpeed
            ? x_speed > 0
              ? maxSpeed
              : -maxSpeed
            : x_speed;

        y_speed = -0.4 * y_speed + (Math.random(0, 1) * 2 - 1) * 2;
      }
    }

    if (ball.positionX > rightDistance - 30) {
      if (rightBoundLow < centerOfBall && centerOfBall < rightBoundHigh) {
        if (x_speed < 0) {
          return;
        }
        x_speed = -1.5 * x_speed;
        x_speed =
          Math.abs(x_speed) > maxSpeed
            ? x_speed > 0
              ? maxSpeed
              : -maxSpeed
            : x_speed;
        y_speed = -0.4 * y_speed + (Math.random(0, 1) * 2 - 1) * 2;
      }
    }
  };

  const createTeleporter = () => {
    const tele = document.createElement('div');
    tele.classList.add('teleporter');

    const x = Math.random() * 60 + 220;
    const y = Math.random() * 330;
    tele.style.left = `${x}px`;
    tele.style.top = `${y}px`;
    return [tele, x, y];
  };

  const updateTeleport = () => {
    if (tick == 0) {
      return;
    }

    if (tick % 1000 == 0) {
      // spawn teleporter
      const [tele1, x1, y1] = createTeleporter();
      teleporter1.element = tele1;
      teleporter1.positionX = x1;
      teleporter1.positionY = y1;
      Board.appendChild(tele1);

      const [tele2, x2, y2] = createTeleporter();
      teleporter2.element = tele2;
      teleporter2.positionX = x2;
      teleporter2.positionY = y2;
      Board.appendChild(tele2);
    }

    if (tick % 1500 == 0) {
      const teleporters = document.querySelectorAll('.teleporter');

      teleporters.forEach((tele) => {
        Board.removeChild(tele);
      });
      teleporter1.element = null;
      teleporter1.positionX = null;
      teleporter1.positionY = null;

      teleporter2.element = null;
      teleporter2.positionX = null;
      teleporter2.positionY = null;
      //despawn teleporter
    }
  };

  const teleportBall = () => {
    if (teleporter1.element && teleporter2.element && teleportCooldown == 0) {
      if (
        ball.positionX > teleporter1.positionX &&
        ball.positionX < teleporter1.positionX + 15
      ) {
        if (
          teleporter1.positionY - 15 < ball.positionY &&
          ball.positionY + 15 < teleporter1.positionY + 70 + 15
        ) {
          ball.positionY = teleporter2.positionY + 35;
          ball.positionX = teleporter2.positionX + 7.5;
          teleportCooldown = 70;
        }
      }

      if (
        ball.positionX > teleporter2.positionX &&
        ball.positionX < teleporter2.positionX + 15
      ) {
        if (
          teleporter2.positionY - 15 < ball.positionY &&
          ball.positionY < teleporter2.positionY + 70 + 15
        ) {
          ball.positionY = teleporter1.positionY + 35;
          ball.positionX = teleporter1.positionX + 7.5;
          teleportCooldown = 70;
        }
      }
    }
  };

  const updateBall = (ball) => {
    // console.log('run');
    const res = calculate_position();

    if (validateBall(res)) {
      ball.positionX = res[0];
      ball.positionY = res[1];
    } else {
      ball.positionX = res[0];
      ball.positionY = ball.positionY + y_speed;
    }

    bounceBall();
    teleportBall();

    // console.log(ball);

    ball.element.style.top = `${ball.positionY}px`;
    ball.element.style.left = `${ball.positionX}px`;
  };

  updatePlayer(control1, 0);
  updatePlayer(control2, 0);
  updateBall(ball, 235, 185);

  const game = () => {
    if (GAME_CONDITION && GAME_CONDITION.includes('win')) {
      if (!gameCondition.innerHTML) {
        gameCondition.innerHTML = GAME_CONDITION;
      }
      //   alert(GAME_CONDITION);
      return;
    }

    if (commands.down1) {
      updatePlayer(control1, 5);
    }
    if (commands.up1) {
      updatePlayer(control1, -5);
    }

    if (commands.down2) {
      updatePlayer(control2, 5);
    }
    if (commands.up2) {
      updatePlayer(control2, -5);
    }

    updateBall(ball);
    updateTeleport();
    tick = tick + 1;
    teleportCooldown = teleportCooldown > 0 ? teleportCooldown - 1 : 0;
  };

  GAME_CONDITION = '';
  const run = setInterval(game, 7);

  //   const endGame = () => {
  //     clearInterval(run);
  //   };

  endGameBtn.addEventListener('click', () => {
    clearInterval(run);
    window.location.href = window.location.href;
  });
};

startGameBtn.addEventListener('click', () => {
  if (GAME_CONDITION != 'start') {
    console.log('start');
    startGame();
    GAME_CONDITION = 'start';
    tick = 0;
    startGameBtn.remove();
  }
});
