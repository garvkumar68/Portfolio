import { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import axios from 'axios';

ReactModal.setAppElement('#root'); // Set the root element for accessibility

export const ProfessionalSection = () => {
    const [links_state, setLinks] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchProfessionalLinks = async () => {
            try {
                const url = 'https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/professionalLinks.json';
                const response = await axios.get(url);
                setLinks(response.data); // Fixing the data assignment
            } catch (err) {
                console.error('Error fetching data from GitHub', err);
            }
        };

        fetchProfessionalLinks();
    }, []);

    const openVideoModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="professional-section-container">
            <div className="professional-section-box">
                <h3>Professional Window</h3>
                <p>
                    Welcome to my "Professional Window" section, where you can explore a glimpse into my career and skills.
                    With a passion for technology and innovation, I am always seeking opportunities to grow and expand my expertise.
                    In this section, you can watch my video resume (Visume) to get a dynamic overview of my professional journey,
                    or download my detailed resume for a comprehensive look at my qualifications and experience.
                    Whether you're here to learn more about my work or explore potential opportunities, this is where you can find the
                    essential details to understand my professional background.
                </p>
                <div className="buttons-container">
                    <button className="prof-btn" onClick={openVideoModal}>
                        <h4>Visume</h4>
                    </button>
                    <button className="prof-btn">
                        <a
                            href={links_state.resume_PDF || '#'}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <h4>Resume</h4>
                        </a>
                    </button>
                </div>
            </div>

            <ReactModal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Visume Video"
                className="video-modal"
                overlayClassName="video-modal-overlay"
                shouldCloseOnOverlayClick={true}
                closeTimeoutMS={300}
            >
                <button onClick={closeModal} className="close-modal-btn">
                    <span className="visually-hidden">Close</span>
                </button>
                {links_state.visume_video ? (
                    <iframe
                        width="100%"
                        height="400px"
                        src={links_state.visume_video}
                        title="Visume"
                        frameBorder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <p>Loading video...</p>
                )}
            </ReactModal>
        </div>
    );
};
