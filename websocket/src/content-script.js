const HTML = `
<ul class="menu" id="menu" style="z-index: 2147483647; display: none; position: fixed">
  <li class="menu-item menu-disabled">
    <span>clone</span>
  </li>
  <li class="menu-item dismiss">
    <span>dismiss</span>
  </li>
  <li style="padding: 0; margin: 0.35em 0; border-bottom: 1px solid #e6e6e6"></li>
  <li class="menu-item">
    <span>sit</span>
  </li>
  <li class="menu-item rare">
    <span>rare</span>
  </li>
  <li class="menu-item">
    <span>watch</span>
  </li>
  <li class="menu-item">
    <span>jiggle</span>
  </li>
  <li style="padding: 0; margin: 0.35em 0; border-bottom: 1px solid #e6e6e6"></li>
  <li class="menu-item menu-disabled submenu">
    <span>ceiling</span>
    <ul class="menu" style="top: -9.19063px; display: none">
      <li class="menu-item submenu">
        <span>left</span>
        <ul class="menu" style="top: -9.19063px; display: none">
          <li class="menu-item"><span>slow</span></li>
          <li class="menu-item"><span>fast</span></li>
        </ul>
      </li>
      <li class="menu-item submenu">
        <span>right</span>
        <ul class="menu" style="top: -9.19063px; display: none">
          <li class="menu-item"><span>slow</span></li>
          <li class="menu-item"><span>fast</span></li>
        </ul>
      </li>
    </ul>
  </li>
  <li class="menu-item menu-disabled submenu">
    <span>climb</span>
    <ul class="menu" style="top: -9.19063px; display: none">
      <li class="menu-item submenu">
        <span>up</span>
        <ul class="menu" style="top: -9.19063px; display: none">
          <li class="menu-item"><span>slow</span></li>
          <li class="menu-item"><span>fast</span></li>
        </ul>
      </li>
      <li class="menu-item submenu">
        <span>down</span>
        <ul class="menu" style="top: -9.19063px; display: none">
          <li class="menu-item"><span>slow</span></li>
          <li class="menu-item"><span>fast</span></li>
        </ul>
      </li>
    </ul>
  </li>
  <li class="menu-item submenu">
    <span>walk</span>
    <ul class="menu" style="top: -9.19063px; display: none">
      <li class="menu-item submenu">
        <span>left</span>
        <ul class="menu" style="top: -9.19063px; display: none">
          <li class="menu-item"><span>slow</span></li>
          <li class="menu-item"><span>run</span></li>
          <li class="menu-item"><span>dash</span></li>
        </ul>
      </li>
      <li class="menu-item submenu">
        <span>right</span>
        <ul class="menu" style="top: -9.19063px; display: none">
          <li class="menu-item"><span>slow</span></li>
          <li class="menu-item"><span>run</span></li>
          <li class="menu-item"><span>dash</span></li>
        </ul>
      </li>
    </ul>
  </li>
  <li class="menu-item submenu">
    <span>creep</span>
    <ul class="menu" style="top: -9.19063px; display: none">
      <li class="menu-item">
        <span>left</span>
      </li>
      <li class="menu-item">
        <span>right</span>
      </li>
    </ul>
  </li>
  <li style="padding: 0; margin: 0.35em 0; border-bottom: 1px solid #e6e6e6"></li>
  <li class="menu-item">
    <span>steal object...</span>
  </li>
  <li class="menu-item">
    <span>jump onto...</span>
  </li>
  <li class="menu-item menu-disabled">
    <span>fall</span>
  </li>
</ul>
<div class="screen" style="
      position: fixed;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      z-index: 2147483646;
      pointer-events: none;
    "></div>
`;

let images = [];
let characters = [];

//---------------------------------------------------------------------------------------------------------------------------

class Character {
  constructor(id) {
    this.id = id;
    this.images = images;
    this.screen = null;
    this.menu = null;
    this.init();
    this.handleMenu();
    this.position = 2;
    this.x = randInt(10, 90);
    this.y = 0;
    this.onAir = false;
    this.character = null;
    this.selectedDiv = null;
    this.task = null;
    this.draw();
    this.detectScroll();

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg?.info === "newTxn") {
        this.rare(10);
        console.log(msg?.data);
      }
    });
  }

  //  initializes everything (creates root div where the character will move)
  init() {
    const div = document.createElement("div");
    div.id = `shimiji-extension-${this.id}`;
    div.innerHTML = HTML;
    document.body.appendChild(div);
    this.screen = div;
  }

  handleMenuOnClickActions() {
    const clone = this.menu.children[0];
    clone.onclick = () => this.clone();

    const dismiss = this.menu.children[1];
    dismiss.onclick = () => this.dismiss();

    const sit = this.menu.children[3];
    sit.onclick = () => this.sit();

    const rare = this.menu.children[4];
    rare.onclick = () => this.rare();

    const watch = this.menu.children[5];
    watch.onclick = () => this.watch();

    const jiggle = this.menu.children[6];
    jiggle.onclick = () => this.jiggle();

    const ceilingLeftSlow =
      this.menu.children[8].children[1].children[0].children[1].children[0];
    ceilingLeftSlow.onclick = () => this.ceiling("left", "slow");

    const ceilingLeftFast =
      this.menu.children[8].children[1].children[0].children[1].children[1];
    ceilingLeftFast.onclick = () => this.ceiling("left", "fast");

    const ceilingRightSlow =
      this.menu.children[8].children[1].children[1].children[1].children[0];
    ceilingRightSlow.onclick = () => this.ceiling("right", "slow");

    const ceilingRightFast =
      this.menu.children[8].children[1].children[1].children[1].children[1];
    ceilingRightFast.onclick = () => this.ceiling("right", "fast");

    const climbUpSlow =
      this.menu.children[9].children[1].children[0].children[1].children[0];
    climbUpSlow.onclick = () => this.climb("up", "slow");

    const climbUpFast =
      this.menu.children[9].children[1].children[0].children[1].children[1];
    climbUpFast.onclick = () => this.climb("up", "fast");

    const climbDownSlow =
      this.menu.children[9].children[1].children[1].children[1].children[0];
    climbDownSlow.onclick = () => this.climb("down", "slow");

    const climbDownFast =
      this.menu.children[9].children[1].children[1].children[1].children[1];
    climbDownFast.onclick = () => this.climb("down", "fast");

    const walkLeftSlow =
      this.menu.children[10].children[1].children[0].children[1].children[0];
    walkLeftSlow.onclick = () => this.walk("left", "slow");

    const walkLeftRun =
      this.menu.children[10].children[1].children[0].children[1].children[1];
    walkLeftRun.onclick = () => this.walk("left", "run");

    const walkLeftDash =
      this.menu.children[10].children[1].children[0].children[1].children[2];
    walkLeftDash.onclick = () => this.walk("left", "dash");

    const walkRightSlow =
      this.menu.children[10].children[1].children[1].children[1].children[0];
    walkRightSlow.onclick = () => this.walk("right", "slow");

    const walkRightRun =
      this.menu.children[10].children[1].children[1].children[1].children[1];
    walkRightRun.onclick = () => this.walk("right", "run");

    const walkRightDash =
      this.menu.children[10].children[1].children[1].children[1].children[2];
    walkRightDash.onclick = () => this.walk("right", "dash");

    const creepLeft = this.menu.children[11].children[1].children[0];
    creepLeft.onclick = () => this.creep("left");

    const creepRight = this.menu.children[11].children[1].children[1];
    creepRight.onclick = () => this.creep("right");

    const stealObject = this.menu.children[13];
    stealObject.onclick = () => this.stealObject();

    const jumpOnto = this.menu.children[14];
    jumpOnto.onclick = () => this.jumpOnto();

    const fall = this.menu.children[15];
    fall.onclick = () => this.drop();
  }
}

