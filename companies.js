const CompanyProfiles = {
  google: {
    name: 'Google', color: '#4285F4', icon: 'G', tagline: 'Software Engineering',
    jobTitle: 'Senior Software Engineer',
    description: 'Design, develop, test, deploy, maintain, and improve software. Manage project priorities, deadlines, and deliverables. Build distributed systems and scalable infrastructure.',
    requiredSkills: ['python','java','c++','algorithms','data structures','system design','distributed systems','machine learning','sql','linux'],
    preferredSkills: ['go','kubernetes','tensorflow','gcp','google cloud','ci/cd','microservices'],
    minExperience: 3, educationLevel: 'bachelors'
  },
  microsoft: {
    name: 'Microsoft', color: '#00A4EF', icon: 'M', tagline: 'Cloud & AI Engineering',
    jobTitle: 'Software Development Engineer',
    description: 'Build and ship software that empowers every person on the planet. Work on Azure cloud services, developer tools, and AI platforms at massive scale.',
    requiredSkills: ['c#','typescript','azure','sql','rest api','.net','system design','agile','git','docker'],
    preferredSkills: ['python','react','kubernetes','machine learning','devops','powershell','ci/cd'],
    minExperience: 2, educationLevel: 'bachelors'
  },
  amazon: {
    name: 'Amazon', color: '#FF9900', icon: 'A', tagline: 'AWS & Systems Engineering',
    jobTitle: 'SDE II - AWS',
    description: 'Build reliable, scalable, and high-performance distributed systems on AWS. Design APIs and services that handle millions of requests.',
    requiredSkills: ['java','python','aws','distributed systems','system design','sql','rest api','linux','docker','dynamodb'],
    preferredSkills: ['typescript','react','kubernetes','microservices','terraform','ci/cd','agile'],
    minExperience: 3, educationLevel: 'bachelors'
  },
  meta: {
    name: 'Meta', color: '#0668E1', icon: 'F', tagline: 'Frontend & Full-Stack',
    jobTitle: 'Frontend Engineer',
    description: 'Build products used by billions of people. Create engaging user interfaces with React, improve performance of web applications.',
    requiredSkills: ['javascript','react','typescript','html','css','graphql','rest api','git','performance optimization','testing'],
    preferredSkills: ['react native','redux','webpack','node.js','python','system design'],
    minExperience: 2, educationLevel: 'bachelors'
  },
  apple: {
    name: 'Apple', color: '#A2AAAD', icon: '', tagline: 'iOS & Platform Engineering',
    jobTitle: 'Software Engineer - iOS',
    description: 'Design and build advanced applications for the iOS platform. Collaborate with cross-functional teams defining, designing, and shipping new features.',
    requiredSkills: ['swift','ios','objective-c','xcode','swiftui','cocoa touch','core data','git','unit testing','design patterns'],
    preferredSkills: ['python','machine learning','metal','arkit','combine','ci/cd','agile'],
    minExperience: 3, educationLevel: 'bachelors'
  },
  custom: {
    name: 'Custom', color: '#6366f1', icon: '✦', tagline: 'Define your own requirements',
    jobTitle: '', description: '', requiredSkills: [], preferredSkills: [],
    minExperience: 0, educationLevel: 'any'
  }
};
