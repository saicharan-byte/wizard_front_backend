import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

export default function ParticleBackground() {
    const particlesInit = useCallback(async (engine) => {
        await loadFull(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                fullScreen: { enable: false },
                fpsLimit: 60,
                particles: {
                    number: { value: 60, density: { enable: true, area: 900 } },
                    color: { value: ['#6366f1', '#a855f7', '#ec4899', '#818cf8'] },
                    shape: { type: 'circle' },
                    opacity: {
                        value: 0.4,
                        random: { enable: true, minimumValue: 0.15 },
                        animation: { enable: true, speed: 0.8, minimumValue: 0.1, sync: false },
                    },
                    size: {
                        value: 3,
                        random: { enable: true, minimumValue: 1 },
                        animation: { enable: true, speed: 2, minimumValue: 0.5, sync: false },
                    },
                    links: {
                        enable: true,
                        distance: 140,
                        color: '#6366f1',
                        opacity: 0.15,
                        width: 1,
                    },
                    move: {
                        enable: true,
                        speed: 1.2,
                        direction: 'none',
                        random: true,
                        straight: false,
                        outModes: { default: 'out' },
                    },
                },
                interactivity: {
                    events: {
                        onHover: { enable: true, mode: 'repulse' },
                        resize: true,
                    },
                    modes: {
                        repulse: { distance: 120, duration: 0.4 },
                    },
                },
                detectRetina: true,
            }}
        />
    );
}
