import confetti from "canvas-confetti";

function celebrate() {
    confetti({
        particleCount: 400,
        spread: 100,
        origin: { y: 0.6 },
    });
};

export default celebrate;