//=============================================================================
// OCSMenu.js
//=============================================================================

/*:
 * @plugindesc Alternate menu of only character based on resident evil
 * @author Alanderson zelindro da rosa
 *
 * @param mp_bar
 * @desc if 'true', show the mp bar
 * @default false
 *
 * @param t_document
 * @desc name of the files in menu
 * @default Files
 *
 * @param t_exit
 * @desc name of the exit button in menu
 * @default Exit
 *
 * @param t_equiped
 * @desc name of the equiped weapon
 * @default Equiped
 * @help
 *
 * @help
 *
 * Show the image in menu
 * place:
 *
 * <menu_imgs:X>
 *
 * in the item or weapon notpad
 * replace the X by the name of picture in the pictures folder
 * use format PNG and 128x128 proportion
 *
 */

//variaveis
const parameters = PluginManager.parameters("OCSMenu");
const mp_bar = parameters["mp_bar"];
const t_document = parameters["t_document"];
const t_exit = parameters["t_exit"];
const t_equiped = parameters["t_equiped"];
const t_use = parameters["t_use"];
const t_back = parameters["t_back"];

//-----------------------------------------------------------------------------
// Window_OcsMenuComand
//

class Window_OcsMenuComand extends Window_HorzCommand {
  constructor() {
    super();
    this.initialize();
  }
  initialize() {
    const x = Graphics.boxWidth - 400;
    Window_HorzCommand.prototype.initialize.call(this, x, 0);
  }
  windowWidth() {
    return 400;
  }
  maxCols() {
    return 3;
  }
  makeCommandList() {
    this.addCommand(TextManager.item, "item");
    this.addCommand(t_document, "document");
    this.addCommand(t_exit, "gameEnd");
  }
}

//-----------------------------------------------------------------------------
// Window_OcsMenuStatus
//

class Window_OcsMenuStatus extends Window_Base {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    Window_Base.prototype.initialize.call(this, 0, 0, 417, 220);
    const actor = this.Actor();
    this.draw(actor);
    ImageManager.loadFace(actor.faceName());
  }

  drawWeapon(actor) {
    var weapon = actor.equips()[0];
    if (weapon !== null) {
      this.drawIcon(weapon.iconIndex, 180, 144);
      this.drawText(t_equiped + ": ", 180, 104);
      this.drawText(weapon.name, 220, 144);
    }
  }

  drawActorSimpleStatus(actor, x, y, width) {
    const lineHeight = this.lineHeight();
    const x2 = x + 180;
    const width2 = Math.min(200, width - 180 - this.textPadding());
    this.drawActorName(actor, x, y);
    this.drawActorClass(actor, x2, y);
    this.drawActorHp(actor, x2, y + lineHeight * 1, width2);
    if (mp_bar === "true") {
      this.drawActorMp(actor, x2, y + lineHeight * 1 + 35, width2);
    }
  }

  draw(actor) {
    //status
    this.drawActorSimpleStatus(actor, 0, 0, 350);
    //face
    this.drawActorFace(actor, 0, 35);
    //arma
    this.drawWeapon(actor);
  }

  Actor() {
    const actor = $gameParty.members()[0];
    return actor;
  }

  refresh() {
    if (this.contents) {
      this.contents.clear();
      this.draw(this.Actor());
    }
  }
}

//-----------------------------------------------------------------------------
// Window_OcsMenuItems
//

class Window_OcsMenuItems extends Window_ItemList {
  constructor(x, y, width, height) {
    super();
    this.initialize(x, y, width, height);
  }

  makeItemList() {
    this._data = $gameParty.allItems().filter(function(item) {
      return this.includes(item);
    }, this);

    if (this.includes(null)) {
      this._data.push(null);
    }
  }
  includes(item) {
    if (this._category === "keyItem") {
      return DataManager.isItem(item) && item.itypeId === 2;
    } else {
      if (DataManager.isItem(item) && item.itypeId === 1) {
        return true;
      } else if (DataManager.isWeapon(item)) {
        return true;
      } else if (DataManager.isArmor(item)) {
        return true;
      } else {
        return false;
      }
    }
  }
  playOkSound() {}
  isEnabled(item) {
    const Actor = $gameParty.members()[0];

    if (DataManager.isWeapon(item)) {
      return Actor.canEquip(item);
    } else {
      return Actor.canUse(item);
    }
  }
  drawItemNumber(item, x, y, width) {
    if (this.needsNumber()) {
      this.drawText($gameParty.numItems(item), x, y, width, "right");
    }
  }
  drawItemName(item, x, y, width) {
    width = width || 312;
    if (item) {
      var iconBoxWidth = Window_Base._iconWidth + 4;
      this.resetTextColor();
      this.drawIcon(item.iconIndex, x, y);
      this.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth);
    }
  }
  maxCols() {
    return 1;
  }
}

//-----------------------------------------------------------------------------
// Window_OcsMenuItemHelp
//

class Window_OcsMenuItemHelp extends Window_Help {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    const width = 417;
    const height = 400;
    Window_Base.prototype.initialize.call(this, 0, 220, width, height);
    this._text = "";
    this._item = null;
  }

  drawImage() {
    if (this._item) {
      if (typeof this._item.meta.menu_imgs !== "undefined") {
        this._logo = new Sprite();
        this._logo.bitmap = ImageManager.loadPicture(this._item.meta.menu_imgs);
        this.addChild(this._logo);
        this._logo.x = 144;
        this._logo.y = 80;
      }
    }
  }

  setItem(item) {
    this._item = item;
    this.setText(item ? item.description : "");
  }

  setText(text) {
    this._text = this.chunkString(text, 26);
    this.refresh();
  }

  chunkString(str, n) {
    const ret = [];
    for (let i = 0; i < str.length; i += n) ret.push(str.substr(i, n));
    return ret.map(val => val.replace(/^\s+/g, "")).join("\n");
  }

  refresh() {
    this.contents.clear();
    this.removeChild(this._logo);
    this.drawTextEx(this._text, this.textPadding() - 1, 220);
    this.drawImage();
  }

  clear() {
    this.setText("");
    this.removeChild(this._logo);
  }
}

//-----------------------------------------------------------------------------
// Scene_Menu
//
//modificando Status do menu

Scene_Menu.prototype.create = function() {
  Scene_MenuBase.prototype.create.call(this);
  this.createCommandWindow();
  this.createStatusWindow();
  this.createHelpWindow();
  this.createItemWindow();
};
Scene_Menu.prototype.start = function() {
  Scene_MenuBase.prototype.start.call(this);
  this.createStatusWindow();
};
Scene_Menu.prototype.createStatusWindow = function() {
  this._statusWindow = new Window_OcsMenuStatus();
  this.addWindow(this._statusWindow);
};
//mudando parametros de escolha
Scene_Menu.prototype.createCommandWindow = function() {
  this._commandWindow = new Window_OcsMenuComand();
  this._commandWindow.setHandler("item", this.commandItem.bind(this));
  this._commandWindow.setHandler("document", this.commandDocument.bind(this));
  this._commandWindow.setHandler("gameEnd", this.commandGameEnd.bind(this));
  this._commandWindow.setHandler("cancel", this.popScene.bind(this));
  this.addWindow(this._commandWindow);
};
//criando função de itens
Scene_Menu.prototype.commandItem = function() {
  this._itemWindow.setCategory("item");
  if (this._itemWindow._data.length !== 0) {
    this._itemWindow.activate();
    this._itemWindow.selectLast();
  } else {
    SoundManager.playBuzzer();
    this._commandWindow.activate();
  }
};
//criando função de documentos
Scene_Menu.prototype.commandDocument = function() {
  this._itemWindow.setCategory("keyItem");
  if (this._itemWindow._data.length !== 0) {
    this._itemWindow.activate();
    this._itemWindow.selectLast();
  } else {
    SoundManager.playBuzzer();
    this._commandWindow.activate();
  }
};
//criando janela de itens
Scene_Menu.prototype.createItemWindow = function() {
  this._itemWindow = new Window_OcsMenuItems(417, 70, 400, 550);
  this._itemWindow.setHelpWindow(this._helpWindow);
  this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
  this._itemWindow.setHandler("cancel", this.onItemCancel.bind(this));

  this.addWindow(this._itemWindow);
  this._itemWindow.setCategory("item");
};
//criando janela de ajuda
Scene_Menu.prototype.createHelpWindow = function() {
  this._helpWindow = new Window_OcsMenuItemHelp();
  this.addWindow(this._helpWindow);
};

//quando for usado o item
Scene_Menu.prototype.onItemOk = function() {
  if (DataManager.isWeapon(this._itemWindow.item())) {
    this.Actor().changeEquip(0, this._itemWindow.item());
    SoundManager.playEquip();
  } else {
    if (this.isItemEffectsValid()) {
      this.Actor().useItem(this._itemWindow.item());
      this.applyItem();
      if ($gameTemp.isCommonEventReserved()) {
        SceneManager.goto(Scene_Map);
      }
      SoundManager.playUseItem();
    } else {
      SoundManager.playBuzzer();
    }
  }
  this._itemWindow.refresh();
  this._statusWindow.refresh();
  this._itemWindow.activate();
};

Scene_Menu.prototype.onItemCancel = function() {
  this._itemWindow.deselect();
  this._commandWindow.activate();
};

Scene_Menu.prototype.Actor = function() {
  const Actor = $gameParty.members()[0];
  return Actor;
};
Scene_Menu.prototype.applyItem = function() {
  const action = new Game_Action(this.Actor());
  action.setItemObject(this.item());
  action.apply(this.Actor());
  action.applyGlobal();
};
Scene_Menu.prototype.isItemEffectsValid = function() {
  const action = new Game_Action(this.Actor());
  action.setItemObject(this.item());
  return action.testApply(this.Actor());
};
Scene_Menu.prototype.item = function() {
  return this._itemWindow.item();
};
