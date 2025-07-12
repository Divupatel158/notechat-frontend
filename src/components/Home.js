import React from 'react';
import ChatInterface from './ChatInterface';

function Home(props) {
    const { showAlert } = props
    return (
        <>
            <div className="container-fluid p-0">
                <ChatInterface showAlert={showAlert} />
            </div>
        </>
    );
}
export default Home;