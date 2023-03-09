const HTML = `
<ul class="menu" id="menu" style="z-index: 2147483647; display: none; position: fixed">
  <li class="menu-item dismiss">
    <span>disappear</span>
  </li>
  <li style="padding: 0; margin: 0.35em 0; border-bottom: 1px solid #e6e6e6"></li>
  <li class="menu-item">
    <span>stand</span>
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
  <li class="menu-item">
    <span>sofa mode</span>
  </li>
  <li class="menu-item">
    <span>check price</span>
  </li>
  <li class="menu-item">
    <span>check daily revenue</span>
  </li>
  <li style="padding: 0; margin: 0.35em 0; border-bottom: 1px solid #e6e6e6"></li>
  <li class="menu-item">
    <span>birth of nft</span>
  </li>
  <li class="menu-item">
    <span>send transaction</span>
  </li>
  <li class="menu-item">
    <span>buy nft</span>
  </li>
  <li class="menu-item">
    <span>get airdrop</span>
  </li>
  <li class="menu-item">
    <span>level up</span>
  </li>
  <li style="padding: 0; margin: 0.35em 0; border-bottom: 1px solid #e6e6e6"></li>
  <li class="menu-item">
    <span>steal object...</span>
  </li>
  <li class="menu-item">
    <span>jump onto...</span>
  </li>
  <li class="menu-item">
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

const MENU_HEIGHT = 415;

//---------------------------------------------------------------------------------------------------------------------------

let config = {};
let images = {};
let characters = [];
let sofaMode = false;
let petAlreadyLanded = undefined;

class Character {
  constructor(id) {
    this.config = config;
    this.id = id;
    this.images = images;
    this.screen = null;
    this.menu = null;
    this.init();
    this.handleMenu();
    this.x = randInt(82, 92);
    this.y = 0;
    this.onAir = false;
    this.character = null;
    this.selectedDiv = null;
    this.task = null;
    this.ethPrice = 0;
    this.dailyRevenue = 0;
    this.updateETHPrice();
    if (!sofaMode) {
      this.position =
        this.config.positions.stand.id + this.config.positions.stand.default;
      this.draw();
    }
    this.detectScroll();
    this.reactOnChainActivity("buyNFT", "buyNFT");
    this.reactOnChainActivity("sendTransaction", "sendTransaction");
    this.reactOnChainActivity("getAirdrop", "getAirdrop");
    this.reactOnChainActivity("levelUp", "levelUp");
  }

  //  initializes everything (creates root div where the character will move)
  init() {
    const div = document.createElement("div");
    div.id = `sofamon-extension-${this.id}`;
    div.innerHTML = HTML;
    document.body.appendChild(div);
    this.screen = div;
  }

  handleMenuOnClickActions() {
    const disappear = this.menu.children[0];
    disappear.onclick = () => this.dismiss();

    const stand = this.menu.children[2];
    stand.onclick = () => this.stand();

    const walkLeftSlow =
      this.menu.children[3].children[1].children[0].children[1].children[0];
    walkLeftSlow.onclick = () => this.walk("left", "slow");

    const walkLeftRun =
      this.menu.children[3].children[1].children[0].children[1].children[1];
    walkLeftRun.onclick = () => this.walk("left", "run");

    const walkLeftDash =
      this.menu.children[3].children[1].children[0].children[1].children[2];
    walkLeftDash.onclick = () => this.walk("left", "dash");

    const walkRightSlow =
      this.menu.children[3].children[1].children[1].children[1].children[0];
    walkRightSlow.onclick = () => this.walk("right", "slow");

    const walkRightRun =
      this.menu.children[3].children[1].children[1].children[1].children[1];
    walkRightRun.onclick = () => this.walk("right", "run");

    const walkRightDash =
      this.menu.children[3].children[1].children[1].children[1].children[2];
    walkRightDash.onclick = () => this.walk("right", "dash");

    const sofaMode = this.menu.children[4];
    sofaMode.onclick = () => this.sofaMode();

    const checkPrice = this.menu.children[5];
    checkPrice.onclick = () => this.checkPrice();

    const checkDailyRevenue = this.menu.children[6];
    checkDailyRevenue.onclick = () => this.checkDailyRevenue();

    const birthOfNFT = this.menu.children[8];
    birthOfNFT.onclick = () => this.birthOfNFT();

    const sendTransaction = this.menu.children[9];
    sendTransaction.onclick = () => this.sendTransaction();

    const buyNFT = this.menu.children[10];
    buyNFT.onclick = () => this.buyNFT();

    const getAirdrop = this.menu.children[11];
    getAirdrop.onclick = () => this.getAirdrop();

    const levelUp = this.menu.children[12];
    levelUp.onclick = () => this.levelUp();

    const stealObject = this.menu.children[14];
    stealObject.onclick = () => this.stealObject();

    const jumpOnto = this.menu.children[15];
    jumpOnto.onclick = () => this.jumpOnto();

    const fall = this.menu.children[16];
    fall.onclick = () => this.drop();
  }

  //  handles submenu/menu (hides/displays submenu)
  handleMenu() {
    const menuItems = this.screen.getElementsByClassName("menu-item");
    const menu = this.screen.getElementsByClassName("menu")[0];
    this.menu = menu;
    let activeSubMenus = [];

    for (let menuItem of menuItems) {
      menuItem.onmouseenter = (e) => {
        if (e.target.classList.contains("menu-disabled")) return;
        let newActiveSubMenus = [];
        for (let activeSubMenu of activeSubMenus) {
          if (
            e.target !== activeSubMenu &&
            e.target.parentElement.parentElement !== activeSubMenu &&
            e.target.parentElement.parentElement.parentElement.parentElement !==
              activeSubMenu
          ) {
            activeSubMenu.children[1].style.display = "none";
          } else newActiveSubMenus.push(activeSubMenu);
        }
        activeSubMenus = newActiveSubMenus;
        if (e.target.classList.contains("submenu")) {
          if (e.target.parentElement !== this.menu) {
            if (e.target.parentElement.style.left === "-204.188px")
              e.target.children[1].style.left = "193.828px";
            else e.target.children[1].style.left = "-204.188px";
          } else if (
            parseInt(this.menu.style.left) + 420 <
            document.documentElement.clientWidth
          )
            e.target.children[1].style.left = "193.828px";
          else e.target.children[1].style.left = "-204.188px";
          e.target.children[1].style.display = "block";
          if (!activeSubMenus.includes(e.target)) activeSubMenus.push(e.target);
        }
      };
    }

    document.addEventListener("mouseup", (e) => {
      if (
        !e.target.classList.contains("submenu") &&
        !e.target.attributes.src?.value.includes("data:image/png")
      ) {
        this.menu.style.display = "none";
        for (let activeSubMenu of activeSubMenus)
          activeSubMenu.children[1].style.display = "none";
        activeSubMenus = [];
      }
    });
  }

  // detects scroll event and adjusts the position of the character, if it is on top of a div
  detectScroll() {
    document.addEventListener("scroll", () => {
      let selectedDiv = this.getSelectedDiv();
      if (!selectedDiv || this.y === 100) return;
      const { top, left } = this.selectedDiv.getBoundingClientRect();
      this.character.style.top = `${
        top -
        parseInt(selectedDiv.style.top) +
        parseInt(this.character.style.top)
      }px`;
      this.character.style.left = `${
        left -
        parseInt(selectedDiv.style.left) +
        parseInt(this.character.style.left)
      }px`;
      selectedDiv.style.top = `${top}px`;
      selectedDiv.style.left = `${left}px`;
      this.adjustXY();
      this.draw();
    });
  }

  // makes the character dragable and detects the movement direction and changes the position of the character
  makeElementDragable() {
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;

    const dragMouseUp = ({ x, y }) => {
      document.onmouseup = null;
      document.onmousemove = null;
      let selectedDiv = this.getSelectedDiv();
      if (
        selectedDiv &&
        (selectedDiv.style.borderLeft.includes("solid red") ||
          selectedDiv.style.borderRight.includes("solid red") ||
          selectedDiv.style.borderTop.includes("solid red") ||
          selectedDiv.style.borderBottom.includes("solid red"))
      )
        selectedDiv = true;
      else selectedDiv = false;
      if (this.onAir) {
        this.onAir = false;
        this.drop();
      } else if (this.menu.style.display === "none" && !selectedDiv) {
        if (x + 220 < document.documentElement.clientWidth)
          this.menu.style.left = `${x}px`;
        else this.menu.style.left = `${x - 200}px`;
        if (y + 465 < document.documentElement.clientHeight)
          this.menu.style.top = `${y}px`;
        else this.menu.style.top = `${y - MENU_HEIGHT}px`;
        this.handleMenuOnClickActions();
        if (this.isWalkable()) {
          this.menu.children[2].classList.remove("menu-disabled");
          this.menu.children[3].classList.remove("menu-disabled");
          this.menu.children[4].classList.remove("menu-disabled");
          this.menu.children[5].classList.remove("menu-disabled");
          this.menu.children[6].classList.remove("menu-disabled");
          this.menu.children[8].classList.remove("menu-disabled");
          this.menu.children[9].classList.remove("menu-disabled");
          this.menu.children[10].classList.remove("menu-disabled");
          this.menu.children[11].classList.remove("menu-disabled");
          this.menu.children[12].classList.remove("menu-disabled");
          this.menu.children[14].classList.remove("menu-disabled");
          this.menu.children[15].classList.remove("menu-disabled");
        } else {
          this.menu.children[2].classList.add("menu-disabled");
          this.menu.children[3].classList.add("menu-disabled");
          this.menu.children[4].classList.add("menu-disabled");
          this.menu.children[5].classList.add("menu-disabled");
          this.menu.children[6].classList.add("menu-disabled");
          this.menu.children[8].classList.add("menu-disabled");
          this.menu.children[9].classList.add("menu-disabled");
          this.menu.children[10].classList.add("menu-disabled");
          this.menu.children[12].classList.add("menu-disabled");
          this.menu.children[14].classList.add("menu-disabled");
          this.menu.children[15].classList.add("menu-disabled");
        }
        if (this.y !== 100)
          this.menu.children[16].classList.remove("menu-disabled");
        else this.menu.children[16].classList.add("menu-disabled");
        this.menu.style.display = "block";
      } else this.menu.style.display = "none";
      if (selectedDiv) this.jumpOnto();
    };

    const dragMouseMove = (event) => {
      event.preventDefault();
      const taskId = makeId();
      this.task = taskId;
      if (this.task !== taskId) return;
      if (pos1 === 0 && pos2 === 0)
        this.position =
          this.config.positions.drag.id + this.config.positions.drag.onAir;
      else if (pos1 > 0 && pos3 - event.clientX > 0) {
        if (pos1 < 4 && pos3 - event.clientX < 4)
          this.position =
            this.config.positions.drag.id +
            this.config.positions.drag.softRight;
        else
          this.position =
            this.config.positions.drag.id + this.config.positions.drag.right;
      } else if (pos1 > -4 && pos3 - event.clientX > -4)
        this.position =
          this.config.positions.drag.id + this.config.positions.drag.softLeft;
      else if (pos1 < -4 && pos3 - event.clientX < -4)
        this.position =
          this.config.positions.drag.id + this.config.positions.drag.left;
      this.character.style.transform = "unset";
      this.onAir = true;
      this.draw();
      pos1 = pos3 - event.clientX;
      pos2 = pos4 - event.clientY;
      pos3 = event.clientX;
      pos4 = event.clientY;
      this.character.style.top = `${this.character.offsetTop - pos2}px`;
      if (this.character.offsetLeft - pos1 < -this.config.dimension / 2)
        this.character.style.left = `-${this.config.dimension / 2 + 0.48}px`;
      else if (
        this.character.offsetLeft - pos1 >
        document.documentElement.clientWidth - this.config.dimension / 2
      )
        this.character.style.left = `${
          document.documentElement.clientWidth - this.config.dimension / 2
        }px`;
      else this.character.style.left = `${this.character.offsetLeft - pos1}px`;
      this.adjustXY();
    };

    const dragMouseDown = (event) => {
      event.preventDefault();
      pos3 = event.clientX;
      pos4 = event.clientY;
      document.onmouseup = dragMouseUp;
      document.onmousemove = dragMouseMove;
    };

    this.character.onmousedown = dragMouseDown;
    this.character.oncontextmenu = (e) => e.preventDefault();
  }

  // draws the character on the screen (with x, y coordinate)
  draw() {
    if (!this.character) {
      const img = document.createElement("img");
      img.id = this.id;
      img.style.pointerEvents = "auto";
      img.style.position = "absolute";
      const screenEle = this.screen.getElementsByClassName("screen")[0];
      screenEle.appendChild(img);
      this.character = img;
      this.makeElementDragable();
    }
    if (
      sofaMode &&
      !this.position.startsWith(this.config.positions.sofaMode.id) &&
      !this.position.startsWith(this.config.positions.fall.id)
    ) {
      chrome.runtime.sendMessage("sofaModeOff");
    }
    this.character.style.top = `${
      (this.y / 100) * document.documentElement.clientHeight -
      this.config.dimension
    }px`;
    this.character.style.left = `${
      (this.x / 100) * document.documentElement.clientWidth
    }px`;
    this.character.src = this.images[this.position];
    this.handleCheckPrice();
    this.handleCheckDailyRevenue();
  }

  // drop action
  async drop() {
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    let gravity = this.y > 30 ? 30 : this.y;
    this.position =
      this.config.positions.fall.id + this.config.positions.fall.default;
    while (this.y < 100) {
      if (this.task !== taskId) return;
      if (this.menu.style.display === "block") {
        await sleep(100);
        continue;
      }
      this.draw();
      this.y += 0.5;
      if (gravity < 30) gravity += 0.5;
      else if (gravity < 35) gravity += 0.25;
      else if (gravity < 40) gravity += 0.1;
      await sleep(45 - gravity);
    }
    await sleep(100);
    this.y = 100;
    for (let frame = 2; frame <= this.config.positions.fall.frames; frame++) {
      const frameId =
        frame.toString().length === 1
          ? `0${frame.toString()}`
          : frame.toString();
      this.position = this.config.positions.fall.id + frameId;
      this.draw();
      await sleep(75);
    }
    if (!sofaMode) {
      this.position =
        this.config.positions.stand.id + this.config.positions.stand.default;
      this.draw();
    }
  }

  // helps to detect if the character is on ground or on top of a div or on air
  isWalkable() {
    if (this.y === 100) return true;
    let selectedDiv = this.getSelectedDiv();
    if (
      selectedDiv &&
      (parseInt(selectedDiv.style.top) - this.config.dimension ===
        parseInt(this.character.style.top) ||
        parseInt(selectedDiv.style.top) +
          parseInt(selectedDiv.style.minHeight) -
          this.config.dimension ===
          parseInt(this.character.style.top))
    ) {
      return true;
    }
    return false;
  }

  // walk action
  async walk(direction, speed) {
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    if (direction === "right")
      this.character.style.transform = "rotateY(180deg)";
    else this.character.style.transform = "unset";
    const positions = [
      this.config.positions.walk.default,
      this.config.positions.walk.left,
      this.config.positions.walk.default,
      this.config.positions.walk.right,
    ];
    let step = 0;
    let walkingSpeed = 8;
    let sleepTime = 21;
    let leftLimit = -this.config.dimension / 2;
    let rightLimit =
      document.documentElement.clientWidth - this.config.dimension / 2 + 0.33;
    if (speed === "run") {
      walkingSpeed = 10;
      sleepTime = 8;
    } else if (speed === "dash") {
      walkingSpeed = 12;
      sleepTime = 6;
    } else if (speed === "faster") {
      if (this.y !== 100) await this.drop();
      walkingSpeed = 4;
      sleepTime = 0;
      leftLimit = -this.config.dimension * 1.1;
    }
    if (!this.isWalkable()) return;
    if (this.y !== 100) {
      let selectedDiv = this.getSelectedDiv();
      leftLimit =
        parseInt(selectedDiv.style.left) -
        parseInt(this.config.dimension / 2.37);
      rightLimit =
        leftLimit +
        parseInt(selectedDiv.style.minWidth) -
        parseInt(this.config.dimension / 6.4);
      if (leftLimit > parseInt(this.character.style.left))
        this.character.style.left = `${leftLimit}px`;
      else if (rightLimit < parseInt(this.character.style.left))
        this.character.style.left = `${rightLimit}px`;
    }
    while (
      this.isWalkable() &&
      (speed === "faster" || this.task === taskId) &&
      parseInt(this.character.style.left) >= leftLimit &&
      parseInt(this.character.style.left) <= rightLimit
    ) {
      if (this.menu.style.display === "block") {
        await sleep(100);
        continue;
      }
      this.position = this.config.positions.walk.id + positions[step % 4];
      step++;
      for (
        let i = 0;
        i < walkingSpeed &&
        (speed === "faster" || this.task === taskId) &&
        this.isWalkable() &&
        parseInt(this.character.style.left) >= leftLimit &&
        parseInt(this.character.style.left) <= rightLimit;
        i++
      ) {
        if (this.menu.style.display === "block") {
          await sleep(100);
          continue;
        }
        if (speed === "faster")
          this.character.style.left =
            direction === "left"
              ? `${parseInt(this.character.style.left) - 3}px`
              : `${parseInt(this.character.style.left) + 3}px`;
        else
          this.character.style.left =
            direction === "left"
              ? `${parseInt(this.character.style.left) - 1}px`
              : `${parseInt(this.character.style.left) + 1}px`;
        this.adjustXY();
        this.draw();
        await sleep(sleepTime);
      }
    }
    if (speed !== "faster" && this.task !== taskId) return;
    if (!this.isWalkable()) return;
    this.position =
      this.config.positions.stand.id + this.config.positions.stand.default;
    if (this.y === 100)
      this.character.style.left =
        direction === "left"
          ? `-${this.config.dimension / 2 + 0.48}px`
          : `${
              document.documentElement.clientWidth -
              this.config.dimension / 2 +
              0.33
            }px`;
    else
      this.character.style.left =
        direction === "left" ? `${leftLimit}px` : `${rightLimit}px`;
    this.adjustXY();
    this.draw();
  }

  // dismiss action
  async dismiss() {
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    await this.walk("left", "faster");
    if (this.x < 0) this.character.parentElement.parentElement.remove();
  }

  // stand action
  async stand() {
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    if (!this.isWalkable()) return;
    this.position =
      this.config.positions.stand.id + this.config.positions.stand.default;
    this.draw();
  }

  // sofa mode action
  async sofaMode() {
    this.task = "sofaMode";
    if (this.task !== "sofaMode") return;
    chrome.runtime.sendMessage("sofaMode");
    for (
      let frame = 1;
      frame <= this.config.positions.sofaMode.frames &&
      this.task === "sofaMode";
      frame++
    ) {
      const frameId =
        frame.toString().length === 1
          ? `0${frame.toString()}`
          : frame.toString();
      this.position = this.config.positions.sofaMode.id + frameId;
      this.draw();
      await sleep(this.config.positions.sofaMode.delay);
    }
  }

  // check price action
  async checkPrice() {
    const taskId = "checkPrice";
    this.task = taskId;
    if (this.task !== taskId) return;
    chrome.runtime.sendMessage("getETHPrice");
    this.character.style.transform = "unset";
    for (
      let frame = 1;
      frame <= this.config.positions.checkPrice.frames && this.task === taskId;
      frame++
    ) {
      const frameId =
        frame.toString().length === 1
          ? `0${frame.toString()}`
          : frame.toString();
      this.position = this.config.positions.checkPrice.id + frameId;
      this.draw();
      await sleep(this.config.positions.checkPrice.delay);
    }
  }

  // handle check price action
  async handleCheckPrice() {
    const checkPriceSpan =
      this.screen.getElementsByClassName("check-price-span");
    if (checkPriceSpan.length > 0) checkPriceSpan[0].remove();
    if (
      this.config.positions.checkPrice.id +
        this.config.positions.checkPrice.final ===
        this.position &&
      this.task === "checkPrice"
    ) {
      const checkPriceSpan =
        this.screen.getElementsByClassName("check-price-span");
      if (checkPriceSpan.length > 0) return;
      const span = document.createElement("span");
      span.classList.add("check-price-span");
      span.style.pointerEvents = "none";
      span.style.position = "fixed";
      span.style.top = `${
        (this.y / 100) * document.documentElement.clientHeight -
        this.config.dimension / 2.7
      }px`;
      span.style.left = `${
        (this.x / 100) * document.documentElement.clientWidth +
        this.config.dimension / 4.6
      }px`;
      span.style.zIndex = 2147483646;
      span.style.fontSize = "20px";
      span.style.fontWeight = 600;
      span.style.fontFamily = "sans-serif";
      span.innerHTML = "$" + this.ethPrice;
      this.screen.appendChild(span);
    }
  }

  // check daily revenue action
  async checkDailyRevenue() {
    const taskId = "checkDailyRevenue";
    this.task = taskId;
    if (this.task !== taskId) return;
    chrome.runtime.sendMessage("getDailyRevenue");
    this.character.style.transform = "unset";
    for (
      let frame = 1;
      frame <= this.config.positions.checkPrice.frames && this.task === taskId;
      frame++
    ) {
      const frameId =
        frame.toString().length === 1
          ? `0${frame.toString()}`
          : frame.toString();
      this.position = this.config.positions.checkPrice.id + frameId;
      this.draw();
      await sleep(this.config.positions.checkPrice.delay);
    }
  }

  // handle check daily revenue action
  async handleCheckDailyRevenue() {
    const checkDailyRevenueSpan =
      this.screen.getElementsByClassName("check-revenue-span");
    if (checkDailyRevenueSpan.length > 0) checkDailyRevenueSpan[0].remove();
    if (
      this.config.positions.checkPrice.id +
        this.config.positions.checkPrice.final ===
        this.position &&
      this.task === "checkDailyRevenue"
    ) {
      const checkDailyRevenueSpan =
        this.screen.getElementsByClassName("check-revenue-span");
      if (checkDailyRevenueSpan.length > 0) return;
      const span = document.createElement("span");
      span.classList.add("check-revenue-span");
      span.style.pointerEvents = "none";
      span.style.position = "fixed";
      span.style.top = `${
        (this.y / 100) * document.documentElement.clientHeight -
        this.config.dimension / 2.7
      }px`;
      span.style.left = `${
        (this.x / 100) * document.documentElement.clientWidth +
        this.config.dimension / 4.6
      }px`;
      span.style.zIndex = 2147483646;
      span.style.fontSize = "20px";
      span.style.fontWeight = 600;
      span.style.fontFamily = "sans-serif";
      span.innerHTML = "$" + this.dailyRevenue;
      this.screen.appendChild(span);
    }
  }

  // birth of nft action
  async birthOfNFT() {
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    for (let loop = 0; loop < this.config.positions.birthOfNFT.loop; loop++) {
      for (
        let frame = 1;
        frame <= this.config.positions.birthOfNFT.frames &&
        this.task === taskId;
        frame++
      ) {
        const frameId =
          frame.toString().length === 1
            ? `0${frame.toString()}`
            : frame.toString();
        this.position = this.config.positions.birthOfNFT.id + frameId;
        this.draw();
        await sleep(this.config.positions.birthOfNFT.delay);
      }
    }
    if (this.task !== taskId) return;
    this.position =
      this.config.positions.stand.id + this.config.positions.stand.default;
    this.draw();
  }

  // send transaction action
  async sendTransaction() {
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    for (
      let loop = 0;
      loop < this.config.positions.sendTransaction.loop;
      loop++
    ) {
      for (
        let frame = 1;
        frame <= this.config.positions.sendTransaction.frames &&
        this.task === taskId;
        frame++
      ) {
        const frameId =
          frame.toString().length === 1
            ? `0${frame.toString()}`
            : frame.toString();
        this.position = this.config.positions.sendTransaction.id + frameId;
        this.draw();
        await sleep(this.config.positions.sendTransaction.delay);
      }
    }
    if (this.task !== taskId) return;
    this.position =
      this.config.positions.stand.id + this.config.positions.stand.default;
    this.draw();
  }

  // buy nft action
  async buyNFT() {
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    for (let loop = 0; loop < this.config.positions.buyNFT.loop; loop++) {
      for (
        let frame = 1;
        frame <= this.config.positions.buyNFT.frames && this.task === taskId;
        frame++
      ) {
        const frameId =
          frame.toString().length === 1
            ? `0${frame.toString()}`
            : frame.toString();
        this.position = this.config.positions.buyNFT.id + frameId;
        this.draw();
        await sleep(this.config.positions.buyNFT.delay);
      }
    }
    if (this.task !== taskId) return;
    this.position =
      this.config.positions.stand.id + this.config.positions.stand.default;
    this.draw();
  }

  // get air drop action
  async getAirdrop() {
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    for (let loop = 0; loop < this.config.positions.getAirdrop.loop; loop++) {
      for (
        let frame = 1;
        frame <= this.config.positions.getAirdrop.frames &&
        this.task === taskId;
        frame++
      ) {
        const frameId =
          frame.toString().length === 1
            ? `0${frame.toString()}`
            : frame.toString();
        this.position = this.config.positions.getAirdrop.id + frameId;
        this.draw();
        await sleep(this.config.positions.getAirdrop.delay);
      }
    }
    if (this.task !== taskId) return;
    this.position =
      this.config.positions.stand.id + this.config.positions.stand.default;
    this.draw();
  }

  // level up action
  async levelUp() {
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    for (let loop = 0; loop < this.config.positions.levelUp.loop; loop++) {
      for (
        let frame = 1;
        frame <= this.config.positions.levelUp.frames && this.task === taskId;
        frame++
      ) {
        const frameId =
          frame.toString().length === 1
            ? `0${frame.toString()}`
            : frame.toString();
        this.position = this.config.positions.levelUp.id + frameId;
        this.draw();
        await sleep(this.config.positions.levelUp.delay);
      }
    }
    if (this.task !== taskId) return;
    this.position =
      this.config.positions.stand.id + this.config.positions.stand.default;
    this.draw();
  }

  // jump on to action
  async jumpOnto(steal = false) {
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    return new Promise((resolve) => {
      let selectedDiv = this.getSelectedDiv();
      if (selectedDiv) selectedDiv.remove();
      const onClick = async (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        if (
          e.target.attributes.src?.value.includes("data:image/png") ||
          this.menu.contains(e.target)
        )
          return;
        document.onmousemove = null;
        document.onclick = null;
        this.position =
          this.config.positions.jumpOnto.id +
          this.config.positions.jumpOnto.default;
        this.draw();
        const selectedDiv = this.getSelectedDiv();
        if (steal) {
          selectedDiv.style.border = "none";
          const upMovement =
            (parseInt(selectedDiv.style.top) +
              parseInt(selectedDiv.style.minHeight) -
              parseInt(this.character.style.top) -
              parseInt(this.config.dimension / 6)) /
            80;
          let leftMovement;
          if (
            Math.abs(
              parseInt(selectedDiv.style.left) -
                parseInt(this.character.style.left)
            ) <
            Math.abs(
              parseInt(selectedDiv.style.left) +
                parseInt(selectedDiv.style.minWidth) -
                parseInt(this.character.style.left)
            )
          )
            leftMovement =
              (parseInt(selectedDiv.style.left) -
                parseInt(this.character.style.left) -
                this.config.dimension / 2) /
              80;
          else
            leftMovement =
              (parseInt(selectedDiv.style.left) +
                parseInt(selectedDiv.style.minWidth) -
                parseInt(this.character.style.left)) /
              80;
          if (leftMovement > 0)
            this.character.style.transform = "rotateY(180deg)";
          else this.character.style.transform = "unset";
          for (let i = 0; i < 80; i++) {
            this.character.style.top = `${
              parseInt(this.character.style.top) + upMovement
            }px`;
            this.character.style.left = `${
              parseInt(this.character.style.left) + leftMovement
            }px`;
            await sleep(10);
          }
          this.character.style.transform = "unset";
        } else if (selectedDiv.style.borderTop.includes("solid red")) {
          selectedDiv.style.border = "none";
          const upMovement =
            (parseInt(selectedDiv.style.top) -
              parseInt(this.character.style.top) -
              this.config.dimension / 1.5) /
            80;
          const leftMovement =
            (e.x -
              parseInt(this.character.style.left) -
              this.config.dimension / 6.4) /
            80;
          if (leftMovement > 0)
            this.character.style.transform = "rotateY(180deg)";
          else this.character.style.transform = "unset";
          for (let i = 0; i < 80; i++) {
            this.character.style.top = `${
              parseInt(this.character.style.top) + upMovement
            }px`;
            this.character.style.left = `${
              parseInt(this.character.style.left) + leftMovement
            }px`;
            await sleep(10);
          }
          this.character.style.top = `${
            parseInt(selectedDiv.style.top) - this.config.dimension
          }px`;
          this.character.style.left = `${e.x - this.config.dimension / 2}px`;
          this.position =
            this.config.positions.stand.id +
            this.config.positions.stand.default;
        } else if (selectedDiv.style.borderBottom.includes("solid red")) {
          selectedDiv.style.border = "none";
          const upMovement =
            (parseInt(selectedDiv.style.top) +
              parseInt(selectedDiv.style.minHeight) -
              parseInt(this.character.style.top) -
              this.config.dimension / 1.5) /
            80;
          const leftMovement =
            (e.x -
              parseInt(this.character.style.left) -
              this.config.dimension / 6.4) /
            80;
          if (leftMovement > 0)
            this.character.style.transform = "rotateY(180deg)";
          else this.character.style.transform = "unset";
          for (let i = 0; i < 80; i++) {
            this.character.style.top = `${
              parseInt(this.character.style.top) + upMovement
            }px`;
            this.character.style.left = `${
              parseInt(this.character.style.left) + leftMovement
            }px`;
            await sleep(10);
          }
          this.character.style.top = `${
            parseInt(selectedDiv.style.top) +
            parseInt(selectedDiv.style.minHeight) -
            this.config.dimension
          }px`;
          this.character.style.left = `${e.x - this.config.dimension / 2}px`;
          this.position =
            this.config.positions.stand.id +
            this.config.positions.stand.default;
        }
        this.adjustXY();
        this.draw();
        resolve();
      };
      document.onmousemove = (e) => {
        if (
          e.target.style.position === "relative" &&
          e.target.style.visibility === "hidden"
        )
          return;
        if (this.character.contains(e.target)) return;
        this.selectedDiv = e.target;
        this.selectedDiv.onclick = onClick;
        const { top, left, height, width } = e.target.getBoundingClientRect();
        const div = document.createElement("div");
        div.style.position = "absolute";
        div.style.top = `${top}px`;
        div.style.left = `${left}px`;
        div.style.minHeight = `${height}px`;
        div.style.minWidth = `${width}px`;
        if (steal) div.style.border = "3px solid red";
        else if (top + height / 2 < e.y)
          div.style.borderBottom = "3px solid red";
        else div.style.borderTop = "3px solid red";
        div.className = "div-outline";
        selectedDiv = this.getSelectedDiv();
        if (selectedDiv) selectedDiv.remove();
        const screenEle = this.screen.getElementsByClassName("screen")[0];
        screenEle.appendChild(div);
      };
      document.onmouseout = (e) => {
        if (
          !e.target.attributes.src?.value.includes("data:image/png") &&
          !this.menu.contains(e.target)
        )
          e.target.onclick = null;
      };
    });
  }

  // steal object action
  async stealObject() {
    await this.jumpOnto(true);
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    this.position =
      this.config.positions.stealObject.id +
      this.config.positions.stealObject.default;
    const selectedDiv = this.getSelectedDiv();
    if (
      Math.abs(
        parseInt(selectedDiv.style.left) - parseInt(this.character.style.left)
      ) <
      Math.abs(
        parseInt(selectedDiv.style.left) +
          parseInt(selectedDiv.style.minWidth) -
          parseInt(this.character.style.left)
      )
    ) {
      this.character.style.transform = "rotateY(180deg)";
      this.character.style.left = `${
        parseInt(selectedDiv.style.left) - this.config.dimension / 1.85
      }px`;
    } else {
      this.character.style.transform = "unset";
      this.character.style.left = `${
        parseInt(selectedDiv.style.left) +
        parseInt(selectedDiv.style.minWidth) -
        this.config.dimension / 2.2
      }px`;
    }
    this.character.style.top = `${
      parseInt(selectedDiv.style.top) +
      parseInt(selectedDiv.style.minHeight) -
      this.config.dimension / 2.06
    }px`;
    this.adjustXY();
    this.draw();
    let clonedDiv = this.selectedDiv.cloneNode(true);
    this.screen.appendChild(clonedDiv);
    copyComputedStyle(this.selectedDiv, clonedDiv);
    const { top, left, height } = this.selectedDiv.getBoundingClientRect();
    this.selectedDiv.style.position = "relative";
    this.selectedDiv.style.visibility = "hidden";
    clonedDiv.style.position = "fixed";
    clonedDiv.style.top = `${top}px`;
    clonedDiv.style.left = `${left}px`;
    let gravity = this.y > 30 ? 30 : this.y;
    while (this.y < 100) {
      if (this.task !== taskId) return;
      if (this.menu.style.display === "block") {
        await sleep(100);
        continue;
      }
      clonedDiv.style.top = `${
        (this.y / 100) * document.documentElement.clientHeight -
        height -
        this.config.dimension / 2.26
      }px`;
      this.draw();
      this.y += 1.5;
      if (gravity < 30) gravity += 0.5;
      else if (gravity < 35) gravity += 0.25;
      else if (gravity < 40) gravity += 0.1;
      await sleep(45 - gravity);
    }
    await sleep(100);
    this.y = 100;
    clonedDiv.style.top = `${
      (this.y / 100) * document.documentElement.clientHeight -
      height -
      this.config.dimension / 2.26
    }px`;
    this.draw();
    const positions = [
      this.config.positions.stealObject.left,
      this.config.positions.stealObject.right,
    ];
    let step = 0;
    let leftLimit = -this.config.dimension / 2;
    let rightLimit =
      document.documentElement.clientWidth - this.config.dimension / 2 + 1.5;
    if (parseInt(this.character.style.left) > rightLimit) {
      this.character.style.left = `${rightLimit}px`;
      this.adjustXY();
      this.draw();
    }
    if (!this.isWalkable()) return;
    while (
      this.isWalkable() &&
      this.task === taskId &&
      parseInt(this.character.style.left) >= leftLimit &&
      parseInt(this.character.style.left) <= rightLimit
    ) {
      if (this.menu.style.display === "block") {
        await sleep(100);
        continue;
      }
      this.position =
        this.config.positions.stealObject.id + positions[step % 2];
      step++;
      for (
        let i = 0;
        i < 12 &&
        this.isWalkable() &&
        this.task === taskId &&
        parseInt(this.character.style.left) >= leftLimit &&
        parseInt(this.character.style.left) <= rightLimit;
        i++
      ) {
        if (this.menu.style.display === "block") {
          await sleep(100);
          continue;
        }
        this.character.style.left =
          this.character.style.transform === "rotateY(180deg)"
            ? `${parseInt(this.character.style.left) + 3}px`
            : `${parseInt(this.character.style.left) - 3}px`;
        clonedDiv.style.left =
          this.character.style.transform === "rotateY(180deg)"
            ? `${parseInt(clonedDiv.style.left) + 3}px`
            : `${parseInt(clonedDiv.style.left) - 3}px`;
        this.adjustXY();
        this.draw();
        await sleep(2);
      }
    }
    if (this.task !== taskId) return;
    if (!this.isWalkable()) return;
    this.position =
      this.config.positions.stand.id + this.config.positions.stand.default;
    this.character.style.left =
      this.character.style.transform === "unset"
        ? `-${this.config.dimension / 2 + 0.48}px`
        : `${
            document.documentElement.clientWidth -
            this.config.dimension / 2 +
            0.33
          }px`;
    clonedDiv.remove();
    this.adjustXY();
    this.draw();
  }

  // returns selected div (selected while performing jump on to or steal object action)
  getSelectedDiv() {
    const screenEle = this.screen.getElementsByClassName("screen")[0];
    if (screenEle.getElementsByClassName("div-outline").length)
      return screenEle.getElementsByClassName("div-outline")[0];
    else return false;
  }

  // adjusts x and y coordinate (needs adjustments when the position is changed manually with px)
  adjustXY() {
    this.x =
      (parseInt(this.character.style.left) * 100) /
      document.documentElement.clientWidth;
    this.y =
      ((parseInt(this.character.style.top) + this.config.dimension) * 100) /
      document.documentElement.clientHeight;
  }

  // react on chain activity
  reactOnChainActivity(activity, func) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg?.info === activity && this.task !== "sofaMode") {
        this[func]();
        if (msg?.data) console.log(msg?.data);
      }
    });
  }

  // update ETH price and daily revenue
  updateETHPrice() {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg?.info === "ethPrice") {
        this.ethPrice = msg?.price;
      } else if (msg?.info === "dailyRevenue") {
        this.dailyRevenue = msg?.price;
      }
    });
  }

  turnOnSofaMode() {
    this.task = "sofaMode";
    sofaMode = true;
    const frameId =
      this.config.positions.sofaMode.frames.toString().length === 1
        ? `0${this.config.positions.sofaMode.frames.toString()}`
        : this.config.positions.sofaMode.frames.toString();
    this.position = this.config.positions.sofaMode.id + frameId;
    this.draw();
  }

  turnOffSofaMode() {
    sofaMode = false;
    this.position =
      this.config.positions.stand.id + this.config.positions.stand.default;
    this.draw();
  }
}

// helps to steal all styles from selected div (used when performing steal object action)
const realStyle = (_elem, _style) => {
  var computedStyle;
  if (typeof _elem.currentStyle != "undefined") {
    computedStyle = _elem.currentStyle;
  } else {
    computedStyle = document.defaultView.getComputedStyle(_elem, null);
  }

  return _style ? computedStyle[_style] : computedStyle;
};

// helps to steal all styles from selected div (used when performing steal object action)
const copyComputedStyle = (src, dest) => {
  var s = realStyle(src);
  for (var i in s) {
    if (typeof s[i] == "string" && s[i] && i != "cssText" && !/\d/.test(i)) {
      try {
        dest.style[i] = s[i];
        if (i == "font") {
          dest.style.fontSize = s.fontSize;
        }
      } catch (e) {}
    }
  }
};

// returns random integer (random x coordinate while appearing on the screen)
const randInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// sleep action
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// generates random id (used for the screen id and to generate unique ids for tasks)
const makeId = () => {
  let ID = "";
  let characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 12; i++) {
    ID += characters.charAt(Math.floor(Math.random() * 36));
  }
  return ID;
};

// dismiss all characters (triggered when the character is changed or clicked dismiss button on the extension)
const dismissAll = async (msg) => {
  for (let character of characters) {
    try {
      character.dismiss();
    } catch {}
  }
  if (msg) {
    images = msg.images;
    config = msg.config;
    if (msg.landAPetByDefault) main();
  }
};

// returns the total number of characters
const getNumberOfCharacters = () => {
  return document.getElementsByClassName("screen").length;
};

// spawns a new character
const main = async () => {
  const id = makeId();
  const newCharacter = new Character(id);
  if (petAlreadyLanded) {
    newCharacter.y = 100;
    newCharacter.draw();
    petAlreadyLanded = false;
  } else {
    newCharacter.y = 0;
    chrome.runtime.sendMessage("petLanded");
    await newCharacter.drop();
  }
  characters.push(newCharacter);
  if (sofaMode) newCharacter.sofaMode();
};

const mintNFT = async (msg) => {
  for (let character of characters) {
    try {
      character.dismiss();
    } catch {}
  }
  images = msg.images;
  config = msg.config;
  if (msg.landAPetByDefault) main();
  const id = makeId();
  const newCharacter = new Character(id);
  newCharacter.y = 100;
  characters.push(newCharacter);
  if (sofaMode) newCharacter.sofaMode();
  else newCharacter.birthOfNFT();
};

// get character info every 1 sec
setInterval(chrome.runtime.sendMessage, 1000, "getCharacterInfo");

// get sofa mode status every 1 sec
setInterval(chrome.runtime.sendMessage, 1000, "getSofaModeStatus");

chrome.runtime.sendMessage("getCharacterInfo");
chrome.runtime.sendMessage("getSofaModeStatus");
chrome.runtime.sendMessage("isPetAlreadyLanded");
chrome.runtime.onMessage.addListener((msg) => {
  if (msg === "newChar") {
    if (getNumberOfCharacters() >= 3)
      alert("Clone failed! Maximum of 3 sofamon per character.");
    else main();
  } else if (msg === "dismissAll") dismissAll();
  else if (msg?.info === "petAlreadyLanded") {
    petAlreadyLanded = msg?.petAlreadyLanded;
  } else if (msg?.info === "mintNFT") mintNFT(msg);
  else if (msg?.images && typeof petAlreadyLanded !== "undefined") {
    const keys = Object.keys(msg.images);
    if (keys.length > 0 && msg.images[keys[0]] !== images[keys[0]])
      dismissAll(msg);
  } else if (msg?.info === "sofaMode") {
    if (msg?.sofaMode) {
      if (!sofaMode) {
        for (let character of characters) {
          try {
            character.turnOnSofaMode();
          } catch {}
        }
      }
    } else {
      if (sofaMode) {
        for (let character of characters) {
          try {
            character.turnOffSofaMode();
          } catch {}
        }
      }
    }
  }
});
