'use client';
import { StyledBox, StyledHr } from "./StyledComponents";

const WelcomeBox: React.FC = () => {
    return (
        <StyledBox>
            <h3>Welcome In Strength Training Management System!</h3>
            <StyledHr />
            <p>
                Application is designed to help you track and customize your fitness journey. With this intuitive web-based platform, you can:
            </p>
            <ul>
                <li><strong>Create Your Training Plan:</strong> Add exercises tailored to your goals and build a personalized training regimen.</li><br/>
                <li><strong>Track Your Progress:</strong> Log your workouts and report on your performance to see how far you've come.</li><br/>
                <li><strong>Visualize Your Results:</strong> Generate insightful charts and graphs that illustrate your progress over time,<br/> helping you stay motivated and make informed adjustments to your training.</li><br/>
            </ul>
            <StyledHr />
            <p>
                Join and take the next step in achieving your fitness goals!
            </p>
        </StyledBox>
    );
}

export default WelcomeBox;