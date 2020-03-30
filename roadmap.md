# Tekton Dashboard Roadmap

We created the Tekton Dashboard in 2019 as a means to allow Tekton users to see what's going on inside of their cluster when interacting with Tekton resources such as PipelineRuns, TaskRuns and Tasks.

We also identified the opportunity to make things easier for said users - for example, by enhancing the secret creation experience and by providing an extension mechanism.

Here are the items that are a focus for the Dashboard in 2020:

(todo, link these)

1. Observability (which Trigger resulted in which PIpelineRun or TaskRun)
2. Currency (latest Pipeline and Trigger versions)
3. Performance through pagination and sorting (thanks to @afrittoli's dogfooding cluster we know we need this)
4. Visualisations (@AlanGreene has some excellent work in this area already)
5. Platforms (e.g. known to work on various clouds)
6. Improved test story, perhaps with Selenium - something that exercises our functionality against different versions
7. Staying on top of security issues and having a documented procedure
