import React from 'react';
import Notes from './Notes';
import Addnote from './Addnote';
function Home(props) {
    const { showAlert } = props
    return (
        <>
            <h1 className='my-1 d-flex justify-content-center'>Welcome to NoteChat </h1>
            <section className="vh-99">
                <div className="container h-100">
                    <div className="row d-flex align-items-center justify-content-center h-100">
                        <div className="col-md-8 col-lg-7 col-xl-6">
                            <Notes showAlert={showAlert} />
                        </div>
                        <div className="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
                            <Addnote showAlert={showAlert} />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
export default Home;