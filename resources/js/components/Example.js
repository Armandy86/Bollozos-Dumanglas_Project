import React, { useEffect, useState } from "react";

export default function Example() {
    const [fname, setFirstname] = useState("");
    const [lname, setLastname] = useState("");
    const [profiles, setProfiles] = useState([]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/api/register", {
                fname,
                lname,
            });
            alert("Profile created!");
            setFirstname("");
            setLastname("");
        } catch (error) {
            alert("Error creating profile.");
        }
    };


    const fetchProfiles = async () => {
        try {
            const response = await axios.get("/api/profiles"); // Use the correct endpoint
            setProfiles(response.data); // Set all profiles to state
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    };


    useEffect(() => {
        fetchProfiles();
    }, []);


    return (
        <div className="home">
            <div className="container">
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Firstname"
                        value={fname}
                        onChange={(e) => setFirstname(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Lastname"
                        value={lname}
                        onChange={(e) => setLastname(e.target.value)}
                    />
                    <input type="submit" />
                </form>
                <table>
                    <thead>
                        <tr>
                            <th>Firstname</th>
                            <th>Lastname</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((profile) => (
                            <tr key={profile.id}>
                                <td>{profile.fname}</td>
                                <td>{profile.lname}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

