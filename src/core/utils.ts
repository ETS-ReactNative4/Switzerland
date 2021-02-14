export function parseName(name: string): [string, null | CustomElementConstructor, string | null] {
    const [tag, prototype] = name.split('/');
    const extend = prototype ?? null;
    return [tag, getPrototype(prototype), extend];
}

export function getPrototype(name: string): null | CustomElementConstructor {
    if (typeof window === 'undefined') return null;
    const defaultConstructor = window.document.createElement('div').constructor as CustomElementConstructor;
    return name ? (window.document.createElement(name).constructor as CustomElementConstructor) : defaultConstructor;
}

export function getRandomName(): string {
    return `swiss-${Date.now()}-${Math.round(Math.random() * 100)}`;
}