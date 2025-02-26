interface ScrollOptions {
    behavior: ScrollBehavior;
}

export const handleScrollToSection = (id: string): void => {
    const section = document.getElementById(id);
    if (section) {
        const options: ScrollOptions = { behavior: "smooth" };
        section.scrollIntoView(options);
    }
};