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
        if (this.task === "watch") this.watch();
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
      if (!selectedDiv || (this.y === 100 && this.position === 1)) return;
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
        else this.menu.style.top = `${y - 387}px`;
        this.handleMenuOnClickActions();
        if (this.isWalkable("sit", true)) {
          this.menu.children[0].classList.remove("menu-disabled");
          this.menu.children[3].classList.remove("menu-disabled");
          this.menu.children[4].classList.remove("menu-disabled");
          this.menu.children[5].classList.remove("menu-disabled");
          this.menu.children[6].classList.remove("menu-disabled");
        } else {
          this.menu.children[0].classList.add("menu-disabled");
          this.menu.children[3].classList.add("menu-disabled");
          this.menu.children[4].classList.add("menu-disabled");
          this.menu.children[5].classList.add("menu-disabled");
          this.menu.children[6].classList.add("menu-disabled");
        }
        if (this.isWalkable("menu", true)) {
          if (this.y !== 100)
            this.menu.children[8].classList.remove("menu-disabled");
          else this.menu.children[8].classList.add("menu-disabled");
          this.menu.children[9].classList.remove("menu-disabled");
          this.menu.children[10].classList.remove("menu-disabled");
          this.menu.children[11].classList.remove("menu-disabled");
        } else {
          this.menu.children[9].classList.add("menu-disabled");
          this.menu.children[10].classList.add("menu-disabled");
          this.menu.children[11].classList.add("menu-disabled");
        }
        if (this.y !== 100)
          this.menu.children[15].classList.remove("menu-disabled");
        else this.menu.children[15].classList.add("menu-disabled");
        if (this.isClimbable())
          this.menu.children[9].classList.remove("menu-disabled");
        else this.menu.children[9].classList.add("menu-disabled");
        this.menu.style.display = "block";
      } else {
        this.menu.style.display = "none";
        if (this.task === "watch") this.watch();
      }
      if (selectedDiv) this.jumpOnto();
    };

    const dragMouseMove = (event) => {
      event.preventDefault();
      const taskId = makeId();
      this.task = taskId;
      if (this.task !== taskId) return;
      if (pos1 === 0 && pos2 === 0) this.position = 1;
      else if (pos1 > 0 && pos3 - event.clientX > 0) this.position = 8;
      else if (pos1 > -4 && pos3 - event.clientX > -4) this.position = 7;
      else if (pos1 < -4 && pos3 - event.clientX < -4) this.position = 9;
      this.character.style.transform = "unset";
      this.onAir = true;
      this.draw();
      pos1 = pos3 - event.clientX;
      pos2 = pos4 - event.clientY;
      pos3 = event.clientX;
      pos4 = event.clientY;
      this.character.style.top = `${this.character.offsetTop - pos2}px`;
      if (this.character.offsetLeft - pos1 < -96)
        this.character.style.left = "-96.48px";
      else if (
        this.character.offsetLeft - pos1 >
        document.documentElement.clientWidth - 96
      )
        this.character.style.left = `${
          document.documentElement.clientWidth - 96
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
    if (this.position === 30 || this.position === 31)
      this.character.style.top = `${
        (this.y / 100) * document.documentElement.clientHeight - 160
      }px`;
    else if (
      document.documentElement.clientHeight -
        parseInt(this.character.style.top) ===
      160
    ) {
      this.y = 100;
      this.character.style.top = `${
        (this.y / 100) * document.documentElement.clientHeight - 192
      }px`;
    } else
      this.character.style.top = `${
        (this.y / 100) * document.documentElement.clientHeight - 192
      }px`;
    this.character.style.left = `${
      (this.x / 100) * document.documentElement.clientWidth
    }px`;
    this.character.src = this.images[this.position - 1];
  }

  // drop action
  async drop() {
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    let gravity = this.y > 30 ? 30 : this.y;
    this.position = 4;
    while (this.y < 100) {
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
    this.position = 18;
    this.draw();
    await sleep(300);
    this.position = 19;
    this.draw();
    await sleep(300);
    this.position = 1;
    this.draw();
  }

  // clone action
  async clone() {
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    if (getNumberOfCharacters() >= 3) {
      alert("Clone failed! Maximum of 3 shimejis per character.");
    } else if (this.y === 100) {
      await this.clone_1();
      const id = makeId();
      const newCharacter = new Character(id);
      characters.push(newCharacter);
      newCharacter.x = this.x + 10;
      newCharacter.y = 100;
      newCharacter.sit();
    } else {
      await this.clone_2();
      const id = makeId();
      const newCharacter = new Character(id);
      characters.push(newCharacter);
      newCharacter.x = this.x - 10;
      newCharacter.y = this.y;
      newCharacter.drop();
    }
  }

  // clone type 1: performed when the character is on ground
  async clone_1() {
    const positions = [42, 43, 44, 45, 46];
    for (let position of positions) {
      this.position = position;
      this.draw();
      await sleep(250);
    }
    await sleep(250);
    this.position = 1;
    this.draw();
  }

  // clone type 2: performed when the character is on air
  async clone_2() {
    const positions = [38, 39, 40, 41];
    for (let position of positions) {
      this.position = position;
      this.draw();
      await sleep(500);
    }
    await sleep(250);
    this.position = 1;
    this.draw();
  }

  // helps to detect if the character is on ground or on top of a div or on air
  isWalkable(task = null, menu = false) {
    if (this.y === 100) return true;
    if (
      task !== "ceiling" &&
      task !== "sit" &&
      (parseInt(this.character.style.left) === -96 ||
        parseInt(this.character.style.left) ===
          document.documentElement.clientWidth - 96)
    ) {
      if (task !== "menu") {
        this.y = 100;
        this.draw();
      }
      return true;
    }
    let selectedDiv = this.getSelectedDiv();
    if (
      selectedDiv &&
      (parseInt(this.character.style.top) === parseInt(selectedDiv.style.top) ||
        parseInt(this.character.style.top) ===
          parseInt(selectedDiv.style.top) +
            parseInt(selectedDiv.style.minHeight))
    ) {
      if (
        task !== "ceiling" &&
        task !== "sit" &&
        task !== "menu" &&
        parseInt(selectedDiv.style.top) === parseInt(this.character.style.top)
      ) {
        this.character.style.top = `${parseInt(selectedDiv.style.top) - 192}px`;
        this.adjustXY();
      } else if (task !== "ceiling" && task !== "sit" && task !== "menu") {
        this.character.style.top = `${
          parseInt(selectedDiv.style.top) +
          parseInt(selectedDiv.style.minHeight) -
          192
        }px`;
        this.adjustXY();
      }
      return true;
    }
    if (
      selectedDiv &&
      (parseInt(selectedDiv.style.top) - 192 ===
        parseInt(this.character.style.top) ||
        parseInt(selectedDiv.style.top) +
          parseInt(selectedDiv.style.minHeight) -
          192 ===
          parseInt(this.character.style.top))
    ) {
      if (
        task === "ceiling" &&
        parseInt(selectedDiv.style.top) - 192 ===
          parseInt(this.character.style.top)
      )
        this.character.style.top = selectedDiv.style.top;
      else if (
        task === "ceiling" &&
        parseInt(selectedDiv.style.top) +
          parseInt(selectedDiv.style.minHeight) -
          192 ===
          parseInt(this.character.style.top)
      )
        this.character.style.top = `${
          parseInt(selectedDiv.style.top) +
          parseInt(selectedDiv.style.minHeight)
        }px`;
      return true;
    }
    if (
      selectedDiv &&
      (parseInt(selectedDiv.style.top) - 160 ===
        parseInt(this.character.style.top) ||
        parseInt(selectedDiv.style.top) +
          parseInt(selectedDiv.style.minHeight) -
          160 ===
          parseInt(this.character.style.top))
    ) {
      if (
        task !== "jiggle" &&
        !menu &&
        parseInt(selectedDiv.style.top) - 160 ===
          parseInt(this.character.style.top)
      )
        this.character.style.top = `${parseInt(selectedDiv.style.top) - 192}px`;
      else if (task !== "jiggle" && !menu)
        this.character.style.top = `${
          parseInt(selectedDiv.style.top) +
          parseInt(selectedDiv.style.minHeight) -
          192
        }px`;
      return true;
    }
    if (
      selectedDiv &&
      parseInt(selectedDiv.style.top) - 96 ===
        parseInt(this.character.style.top)
    ) {
      if (task === "sit") return false;
      else if (task !== "menu")
        this.character.style.top = `${parseInt(selectedDiv.style.top) - 192}px`;
      return true;
    }
    if (
      selectedDiv &&
      parseInt(selectedDiv.style.top) +
        parseInt(selectedDiv.style.minHeight) -
        165 ===
        parseInt(this.character.style.top)
    ) {
      if (task === "sit") return false;
      else if (task !== "menu")
        this.character.style.top = `${
          parseInt(selectedDiv.style.top) +
          parseInt(selectedDiv.style.minHeight) -
          192
        }px`;
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
    const positions = [1, 2, 1, 3];
    let step = 0;
    let walkingSpeed = 8;
    let sleepTime = 21;
    let leftLimit = -96;
    let rightLimit = document.documentElement.clientWidth - 94.5;
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
      leftLimit = -200;
    }
    if (!this.isWalkable()) return;
    if (this.y !== 100) {
      let selectedDiv = this.getSelectedDiv();
      leftLimit = parseInt(selectedDiv.style.left) - 81;
      rightLimit = leftLimit + parseInt(selectedDiv.style.minWidth) - 30;
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
      this.position = positions[step % 4];
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
    this.position = 1;
    if (this.y === 100)
      this.character.style.left =
        direction === "left"
          ? "-96.48px"
          : `${document.documentElement.clientWidth - 95.67}px`;
    else
      this.character.style.left =
        direction === "left" ? `${leftLimit}px` : `${rightLimit}px`;
    this.adjustXY();
    this.draw();
  }

  // ceiling action
  async ceiling(direction, speed) {
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    if (direction === "right")
      this.character.style.transform = "rotateY(180deg)";
    else this.character.style.transform = "unset";
    const positions = [23, 24, 23, 25];
    let step = 0;
    let walkingSpeed = 8;
    let sleepTime = 21;
    if (speed === "fast") {
      walkingSpeed = 10;
      sleepTime = 8;
    }
    if (!this.isWalkable("ceiling")) return;
    let selectedDiv = this.getSelectedDiv();
    let leftLimit = parseInt(selectedDiv.style.left) - 81;
    let rightLimit = leftLimit + parseInt(selectedDiv.style.minWidth) - 30;
    if (leftLimit > parseInt(this.character.style.left))
      this.character.style.left = `${leftLimit}px`;
    else if (rightLimit < parseInt(this.character.style.left))
      this.character.style.left = `${rightLimit}px`;
    while (
      this.isWalkable("ceiling") &&
      this.task === taskId &&
      parseInt(this.character.style.left) >= leftLimit &&
      parseInt(this.character.style.left) <= rightLimit
    ) {
      if (this.menu.style.display === "block") {
        await sleep(100);
        continue;
      }
      this.position = positions[step % 4];
      step++;
      for (
        let i = 0;
        i < walkingSpeed &&
        this.task === taskId &&
        this.isWalkable("ceiling") &&
        parseInt(this.character.style.left) >= leftLimit &&
        parseInt(this.character.style.left) <= rightLimit;
        i++
      ) {
        if (this.menu.style.display === "block") {
          await sleep(100);
          continue;
        }
        this.character.style.left =
          direction === "left"
            ? `${parseInt(this.character.style.left) - 1}px`
            : `${parseInt(this.character.style.left) + 1}px`;
        this.adjustXY();
        this.draw();
        await sleep(sleepTime);
      }
    }
    if (this.task !== taskId) return;
    if (!this.isWalkable("ceiling")) return;
    this.position = 23;
    if (this.y === 100)
      this.character.style.left =
        direction === "left"
          ? "-96.48px"
          : `${document.documentElement.clientWidth - 95.67}px`;
    else
      this.character.style.left =
        direction === "left" ? `${leftLimit}px` : `${rightLimit}px`;
    this.adjustXY();
    this.draw();
  }

  // creep action
  async creep(direction) {
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    if (direction === "right")
      this.character.style.transform = "rotateY(180deg)";
    else this.character.style.transform = "unset";
    if (!this.isWalkable()) return;
    const positions = [20, 21];
    let step = 0;
    let leftLimit = -95;
    let rightLimit = document.documentElement.clientWidth - 100;
    if (this.y !== 100) {
      let selectedDiv = this.getSelectedDiv();
      leftLimit = parseInt(selectedDiv.style.left) - 81;
      rightLimit = leftLimit + parseInt(selectedDiv.style.minWidth) - 30;
    }
    if (parseInt(this.character.style.left) < leftLimit) {
      this.character.style.left = `${leftLimit}px`;
      this.adjustXY();
    } else if (parseInt(this.character.style.left) > rightLimit) {
      this.character.style.left = `${rightLimit}px`;
      this.adjustXY();
    }
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
      this.position = positions[step % 2];
      if (step % 2) {
        for (
          let i = 0;
          i < 28 &&
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
            direction === "left"
              ? `${parseInt(this.character.style.left) - 1}px`
              : `${parseInt(this.character.style.left) + 1}px`;
          this.adjustXY();
          this.draw();
          await sleep(25);
        }
      }
      this.draw();
      await sleep(1800);
      step++;
    }
    if (this.task !== taskId) return;
    if (!this.isWalkable()) return;
    this.position = 1;
    if (this.y === 100)
      this.character.style.left =
        direction === "left"
          ? "-96.48px"
          : `${document.documentElement.clientWidth - 95.67}px`;
    else
      this.character.style.left =
        direction === "left" ? `${leftLimit}px` : `${rightLimit}px`;
    this.adjustXY();
    this.draw();
  }

  // helps to detect if the character is on the edge (of a div or screen) or not
  isClimbable(task = null) {
    if (
      parseInt(this.character.style.left) === -96 ||
      parseInt(this.character.style.left) ===
        document.documentElement.clientWidth - 96
    )
      return true;
    let selectedDiv = this.getSelectedDiv();
    if (
      selectedDiv &&
      (parseInt(selectedDiv.style.left) - 81 ===
        parseInt(this.character.style.left) ||
        parseInt(selectedDiv.style.left) +
          parseInt(selectedDiv.style.minWidth) -
          111 ===
          parseInt(this.character.style.left))
    ) {
      if (task === "climb") {
        if (this.character.style.transform === "rotateY(180deg)") {
          this.character.style.transform = "unset";
          this.character.style.left = `${
            parseInt(selectedDiv.style.left) +
            parseInt(selectedDiv.style.minWidth) -
            65
          }px`;
        } else {
          this.character.style.transform = "rotateY(180deg)";
          this.character.style.left = `${
            parseInt(selectedDiv.style.left) - 125
          }px`;
        }
      }
      return true;
    }
    if (
      selectedDiv &&
      (parseInt(selectedDiv.style.left) ===
        parseInt(this.character.style.left) + 125 ||
        parseInt(selectedDiv.style.left) +
          parseInt(selectedDiv.style.minWidth) ===
          parseInt(this.character.style.left) + 65)
    )
      return true;
    return false;
  }

  // climb action
  async climb(direction, speed) {
    const taskId = makeId();
    this.task = taskId;
    if (this.task !== taskId) return;
    const positions = [13, 12, 14, 12];
    let step = 0;
    let climbingSpeed = 8;
    let sleepTime = [25, 1000];
    let upLimit = -96;
    let downLimit = document.documentElement.clientHeight - 95.67;
    let selectedDiv = this.getSelectedDiv();
    if (
      selectedDiv &&
      this.y !== 100 &&
      (parseInt(this.character.style.left) !== -96 ||
        parseInt(this.character.style.left) !==
          document.documentElement.clientWidth - 96)
    ) {
      upLimit = parseInt(selectedDiv.style.top) - 96;
      downLimit = upLimit + parseInt(selectedDiv.style.minHeight) - 69;
      if (parseInt(this.character.style.top) < upLimit)
        this.character.style.top = `${upLimit}px`;
      else if (parseInt(this.character.style.top) > downLimit)
        this.character.style.top = `${downLimit}px`;
    }
    if (speed === "fast") {
      climbingSpeed = 18;
      sleepTime = [4, 200];
    }
    if (this.y === 100) {
      this.character.style.top = `${parseInt(this.character.style.top) + 90}px`;
      this.position = 13;
      this.adjustXY();
      this.draw();
    }
    if (!this.isClimbable("climb")) return;
    if (
      parseInt(this.character.style.left) ===
      document.documentElement.clientWidth - 96
    )
      this.character.style.transform = "rotateY(180deg)";
    while (
      this.isClimbable() &&
      this.task === taskId &&
      parseInt(this.character.style.top) >= upLimit &&
      parseInt(this.character.style.top) <= downLimit
    ) {
      if (this.menu.style.display === "block") {
        await sleep(100);
        continue;
      }
      this.position = positions[step % 4];
      step++;
      for (
        let i = 0;
        i < climbingSpeed &&
        this.task === taskId &&
        this.isClimbable() &&
        parseInt(this.character.style.top) >= upLimit &&
        parseInt(this.character.style.top) <= downLimit;
        i++
      ) {
        if (this.menu.style.display === "block") {
          await sleep(100);
          continue;
        }
        this.character.style.top =
          direction === "up"
            ? `${parseInt(this.character.style.top) - 1}px`
            : `${parseInt(this.character.style.top) + 1}px`;
        this.adjustXY();
        await sleep(sleepTime[0]);
      }
      this.adjustXY();
      this.draw();
      await sleep(this.position === 12 ? 50 : sleepTime[1]);
    }
    if (this.task !== taskId) return;
    if (!this.isClimbable()) return;
    this.position = 13;
    if (this.y === 100)
      this.character.style.top =
        direction === "up"
          ? "-96.48px"
          : `${document.documentElement.clientHeight - 95.67}px`;
    else
      this.character.style.top =
        direction === "up" ? `${upLimit}px` : `${downLimit}px`;
    this.adjustXY();
    this.draw();
  }

  // sit action
  sit() {
    const taskId = makeId()
    this.task = taskId
    if (this.task !== taskId) return
    this.character.style.transform = 'unset'
    if (!this.isWalkable() || !this.isWalkable('sit')) return
    this.position = 11
    this.draw()
  }

  // watch action
  watch() {
    const taskId = 'watch'
    this.task = taskId
    if (this.task !== taskId) return
    this.character.style.transform = 'unset'
    if (!this.isWalkable() || !this.isWalkable('sit')) return
    this.position = 26
    this.draw()
    const trackCursor = ({ x }) => {
      if (this.menu.style.display === 'block') return
      if (this.task !== taskId) document.onmousemove = null
      else if ((this.x * document.documentElement.clientWidth) / 100 + 96 < x)
        this.character.style.transform = 'rotateY(180deg)'
      else this.character.style.transform = 'unset'
    }
    document.onmousemove = trackCursor
  }

  // rare action
  async rare(rounds = Number.MAX_VALUE) {
    const taskId = makeId()
    this.task = taskId
    if (this.task !== taskId) return
    this.character.style.transform = 'unset'
    if (!this.isWalkable() || !this.isWalkable('sit')) return
    const positions = [26, 15, 27, 16, 28, 17, 29]
    let step = 0
    while (this.isWalkable('sit') && this.task === taskId && step < rounds) {
      if (this.menu.style.display === 'block') {
        await sleep(100)
        continue
      }
      this.position = positions[step % 7]
      this.draw()
      step++
      await sleep(300)
      if (rounds === step + 1) this.sit()
    }
  }

  // jiggle action
  async jiggle() {
    const taskId = makeId()
    this.task = taskId
    if (this.task !== taskId) return
    this.character.style.transform = 'unset'
    const positions = [30, 31]
    let step = 0
    while (this.isWalkable('jiggle') && this.task === taskId) {
      if (this.menu.style.display === 'block') {
        await sleep(100)
        continue
      }
      this.position = positions[step % 2]
      this.draw()
      step++
      await sleep(800)
    }
  }
}
