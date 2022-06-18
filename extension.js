/*
 * aware@atareao.es
 *
 * Copyright (c) 2020 Lorenzo Carbonell Cerezo <a.k.a. atareao>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */


const {Gtk, Gdk, Gio, Clutter, St, GObject, GLib} = imports.gi;

const Params = imports.misc.params;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain(Extension.uuid);
const _ = Gettext.gettext;

var AwareIndicator = GObject.registerClass(
    class AwareIndicator extends PanelMenu.Button{
        _init(){
            super._init(0.0, "AwareIndicator");
            this._settings = ExtensionUtils.getSettings();
            this._sourceId = null;
            this._startTime = GLib.DateTime.new_now_utc();

            /* Icon indicator */
            let box = new St.BoxLayout({vertical: false,
                                        style_class: 'panel-status-menu-box'});
            this.label = new St.Label({
                text: '0m',
                y_expand: true,
                y_align: Clutter.ActorAlign.CENTER });
            box.add(this.label);
            this.add_child(box);

            this.settingsMenuItem = new PopupMenu.PopupMenuItem(_("Settings"));
            this.settingsMenuItem.connect('activate', () => {
                ExtensionUtils.openPrefs();
            });
            this.menu.addMenuItem(this.settingsMenuItem);

            this._settings = ExtensionUtils.getSettings();
            this._handlerId = this._settings.connect('changed', ()=>{
                this._loadPreferences();
            });

            if(this._sourceId){
                GLib.source_remove(this._sourceId);
                this._sourceId = null;
            }
            this._sourceId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, ()=>{
                let current = GLib.DateTime.new_now_utc();
                let diff = Math.round(current.difference(this._startTime) / 1000000 / 60);
                let aware = null;
                if(diff < 60){
                    aware = `${diff}m`
                }else{
                    let hours = Math.round(diff/60);
                    let minutes = Math.round(diff - hours*60);
                    aware = `${hours}h:${minutes}m`
                }
                this.label.set_text(aware);
                if(this._showNotifications){
                    if(diff > this._dangerTime){
                        Main.notify("Since Indicator", `Danger. You have been working continuously for more than ${this._dangerTime} minutes`);
                    }else if (diff > this._warningTime){
                        Main.notify("Since Indicator", `Warning: You have been working continuously for more than ${this._warningTime} minutes`);
                    }
                }
                return true;
            });
        }

        _getValue(keyName){
            return this._settings.get_value(keyName).deep_unpack();
        }

        _loadPreferences(){
            this._warningTime = this._getValue('warning-time');
            this._dangerTime = this._getValue('danger-time');
            this._showNotifications = this._getValue('notifications');
        }

        destroy(){
            if(this._sourceId){
                GLib.source_remove(this._sourceId);
                this._sourceId = null;
            }
            super.destroy();
        }
    }
);

let sinceIndicator = null;

function init() {
    ExtensionUtils.initTranslations();
}

function enable() {
    sinceIndicator = new AwareIndicator();
    Main.panel.addToStatusArea('SinceIndicator', sinceIndicator);
}

function disable() {
    sinceIndicator.destroy();
    sinceIndicator = null;
}
