import { Plugin } from "obsidian";
import { AgendaView, AGENDAVIEW_VIEW_TYPE } from "./src/view/AgendaView";

export default class AgendaPlugin extends Plugin {
  async onload(): Promise<void> {
    this.registerView(
      AGENDAVIEW_VIEW_TYPE,
      (leaf) => new AgendaView(leaf, this)
    );
  }
}
