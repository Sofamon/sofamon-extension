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
    const menuItems = this.screen.getElementsByClassName('menu-item')
    const menu = this.screen.getElementsByClassName('menu')[0]
    this.menu = menu
    let activeSubMenus = []

    for (let menuItem of menuItems) {
      menuItem.onmouseenter = (e) => {
        if (e.target.classList.contains('menu-disabled')) return
        let newActiveSubMenus = []
        for (let activeSubMenu of activeSubMenus) {
          if (
            e.target !== activeSubMenu &&
            e.target.parentElement.parentElement !== activeSubMenu &&
            e.target.parentElement.parentElement.parentElement.parentElement !==
            activeSubMenu
          ) {
            activeSubMenu.children[1].style.display = 'none'
          } else newActiveSubMenus.push(activeSubMenu)
        }
        activeSubMenus = newActiveSubMenus
        if (e.target.classList.contains('submenu')) {
          if (e.target.parentElement !== this.menu) {
            if (e.target.parentElement.style.left === '-204.188px')
              e.target.children[1].style.left = '193.828px'
            else e.target.children[1].style.left = '-204.188px'
          } else if (
            parseInt(this.menu.style.left) + 420 <
            document.documentElement.clientWidth
          )
            e.target.children[1].style.left = '193.828px'
          else e.target.children[1].style.left = '-204.188px'
          e.target.children[1].style.display = 'block'
          if (!activeSubMenus.includes(e.target)) activeSubMenus.push(e.target)
        }
      }
    }

    document.addEventListener('mouseup', (e) => {
      if (
        !e.target.classList.contains('submenu') &&
        !e.target.attributes.src?.value.includes('data:image/png')
      ) {
        this.menu.style.display = 'none'
        if (this.task === 'watch') this.watch()
        for (let activeSubMenu of activeSubMenus)
          activeSubMenu.children[1].style.display = 'none'
        activeSubMenus = []
      }
    })
  }

  // detects scroll event and adjusts the position of the character, if it is on top of a div
  detectScroll() {
    document.addEventListener('scroll', () => {
      let selectedDiv = this.getSelectedDiv()
      if (!selectedDiv || (this.y === 100 && this.position === 1)) return
      const { top, left } = this.selectedDiv.getBoundingClientRect()
      this.character.style.top = `${top -
        parseInt(selectedDiv.style.top) +
        parseInt(this.character.style.top)
        }px`
      this.character.style.left = `${left -
        parseInt(selectedDiv.style.left) +
        parseInt(this.character.style.left)
        }px`
      selectedDiv.style.top = `${top}px`
      selectedDiv.style.left = `${left}px`
      this.adjustXY()
      this.draw()
    })
  }

  // makes the character dragable and detects the movement direction and changes the position of the character
  makeElementDragable() {
    let pos1 = 0
    let pos2 = 0
    let pos3 = 0
    let pos4 = 0

    const dragMouseUp = ({ x, y }) => {
      document.onmouseup = null
      document.onmousemove = null
      let selectedDiv = this.getSelectedDiv()
      if (
        selectedDiv &&
        (selectedDiv.style.borderLeft.includes('solid red') ||
          selectedDiv.style.borderRight.includes('solid red') ||
          selectedDiv.style.borderTop.includes('solid red') ||
          selectedDiv.style.borderBottom.includes('solid red'))
      )
        selectedDiv = true
      else selectedDiv = false
      if (this.onAir) {
        this.onAir = false
        this.drop()
      } else if (this.menu.style.display === 'none' && !selectedDiv) {
        if (x + 220 < document.documentElement.clientWidth)
          this.menu.style.left = `${x}px`
        else this.menu.style.left = `${x - 200}px`
        if (y + 465 < document.documentElement.clientHeight)
          this.menu.style.top = `${y}px`
        else this.menu.style.top = `${y - 387}px`
        this.handleMenuOnClickActions()
        if (this.isWalkable('sit', true)) {
          this.menu.children[0].classList.remove('menu-disabled')
          this.menu.children[3].classList.remove('menu-disabled')
          this.menu.children[4].classList.remove('menu-disabled')
          this.menu.children[5].classList.remove('menu-disabled')
          this.menu.children[6].classList.remove('menu-disabled')
        } else {
          this.menu.children[0].classList.add('menu-disabled')
          this.menu.children[3].classList.add('menu-disabled')
          this.menu.children[4].classList.add('menu-disabled')
          this.menu.children[5].classList.add('menu-disabled')
          this.menu.children[6].classList.add('menu-disabled')
        }
        if (this.isWalkable('menu', true)) {
          if (this.y !== 100)
            this.menu.children[8].classList.remove('menu-disabled')
          else this.menu.children[8].classList.add('menu-disabled')
          this.menu.children[9].classList.remove('menu-disabled')
          this.menu.children[10].classList.remove('menu-disabled')
          this.menu.children[11].classList.remove('menu-disabled')
        } else {
          this.menu.children[9].classList.add('menu-disabled')
          this.menu.children[10].classList.add('menu-disabled')
          this.menu.children[11].classList.add('menu-disabled')
        }
        if (this.y !== 100)
          this.menu.children[15].classList.remove('menu-disabled')
        else this.menu.children[15].classList.add('menu-disabled')
        if (this.isClimbable())
          this.menu.children[9].classList.remove('menu-disabled')
        else this.menu.children[9].classList.add('menu-disabled')
        this.menu.style.display = 'block'
      } else {
        this.menu.style.display = 'none'
        if (this.task === 'watch') this.watch()
      }
      if (selectedDiv) this.jumpOnto()
    }

    const dragMouseMove = (event) => {
      event.preventDefault()
      const taskId = makeId()
      this.task = taskId
      if (this.task !== taskId) return
      if (pos1 === 0 && pos2 === 0) this.position = 1
      else if (pos1 > 0 && pos3 - event.clientX > 0) this.position = 8
      else if (pos1 > -4 && pos3 - event.clientX > -4) this.position = 7
      else if (pos1 < -4 && pos3 - event.clientX < -4) this.position = 9
      this.character.style.transform = 'unset'
      this.onAir = true
      this.draw()
      pos1 = pos3 - event.clientX
      pos2 = pos4 - event.clientY
      pos3 = event.clientX
      pos4 = event.clientY
      this.character.style.top = `${this.character.offsetTop - pos2}px`
      if (this.character.offsetLeft - pos1 < -96)
        this.character.style.left = '-96.48px'
      else if (
        this.character.offsetLeft - pos1 >
        document.documentElement.clientWidth - 96
      )
        this.character.style.left = `${document.documentElement.clientWidth - 96
          }px`
      else this.character.style.left = `${this.character.offsetLeft - pos1}px`
      this.adjustXY()
    }

    const dragMouseDown = (event) => {
      event.preventDefault()
      pos3 = event.clientX
      pos4 = event.clientY
      document.onmouseup = dragMouseUp
      document.onmousemove = dragMouseMove
    }

    this.character.onmousedown = dragMouseDown
    this.character.oncontextmenu = (e) => e.preventDefault()
  }

}

