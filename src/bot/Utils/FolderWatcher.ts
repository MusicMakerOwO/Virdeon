import fs from 'fs';

export enum ItemType {
	FILE = 0,
	DIRECTORY = 1,
	SYMLINK = 2,
	UNKNOWN = 3
}

export class FolderWatcher {

	public folder: string;
	public recursive: boolean;

	public onAdd:    null | ((filePath: string, type: ItemType) => void);
	public onChange: null | ((filePath: string) => void);
	public onRemove: null | ((filePath: string) => void);

	public watchers: Map<string, fs.FSWatcher>; // path -> watcher

	constructor (folder: string, recursive = true) {

		this.watchers = new Map();

		this.folder = folder;
		this.recursive = recursive;

		this.onAdd    = null;
		this.onRemove = null;
		this.onChange = null;

		this.addWatcher(folder);
	}

	public Destroy () {
		for (const watcher of this.watchers.values()) {
			watcher.close();
		}
		this.onAdd = null;
		this.onRemove = null;
		this.onChange = null;
		this.watchers.clear();
	}

	public GetItemType(file: string): ItemType {
		try {
			const stats = fs.lstatSync(file);
			if (stats.isFile()) return ItemType.FILE;
			if (stats.isDirectory()) return ItemType.DIRECTORY;
			if (stats.isSymbolicLink()) return ItemType.SYMLINK;
		} catch (err) {
			console.error(`Error getting item type for file: ${file}`);
			console.error(err);
		}
		return ItemType.UNKNOWN;
	}
	

	private Add (file: string) {

		if (this.recursive && fs.lstatSync(file).isDirectory()) {
			this.addWatcher(file);
		}

		if (this.onAdd) this.onAdd(file, this.GetItemType(file));
	}

	private Remove (file: string) {

		for (const [path, watcher] of this.watchers) {
			if (path.startsWith(file)) {
				watcher.close();
				this.watchers.delete(path);
			}
		}

		if (this.onRemove) this.onRemove(file);
	}

	private Change (file: string) {
		if (this.onChange) this.onChange(file);
	}

	public WatcherEvent(path: string, event: 'change' | 'rename', filename: string | null) {

		if (!filename) {
			console.warn(`Filename is null for path: ${path}`);
			return;
		}
	
		const fullPath = `${path}/${filename}`;
		if (event === 'change') {
			this.Change(fullPath);
		} else if (event === 'rename') {
			if (fs.existsSync(fullPath)) {
				this.Add(fullPath);
			} else {
				this.Remove(fullPath);
			}
		}
	}
	

	public addWatcher (path: string) {
		if (this.watchers.has(path)) return;
		const watcher = fs.watch(path, this.WatcherEvent.bind(this, path));
		this.watchers.set(path, watcher);

		if (!this.recursive) return;

		const stats = fs.lstatSync(path);
		if (stats.isDirectory()) {
			const items = fs.readdirSync(path, { withFileTypes: true });
			for (const item of items) {
				if (item.isDirectory()) {
					this.addWatcher(`${path}/${item.name}`);
				}
			}
		}
	}
}