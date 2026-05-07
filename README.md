# BlastoDB — GitHub Pages Site

The open hub for *Blastocystis* research.

## Structure

```
blastodb/
├── index.html          ← Homepage with news/newsletter
├── about.html          ← About BlastoDB
├── publications.html   ← Publications database
├── subtypes.html       ← Subtype reference
├── genomes.html        ← Genome / Transcriptomes
├── protocols.html      ← Lab Protocols
├── labs.html           ← Research Labs directory
├── gallery.html        ← Image gallery
├── contact.html        ← Contact page (Prof. Tsaousis, UKent)
├── css/
│   └── style.css       ← Shared stylesheet
├── js/
│   └── shared.js       ← Shared nav + footer injection
├── .nojekyll           ← Disable Jekyll on GitHub Pages
└── README.md
```

## Deploying to GitHub Pages

1. Create a new GitHub repository (e.g. `blastodb`)
2. Push these files to the `main` branch
3. Go to **Settings → Pages** → set source to `main` branch, root `/`
4. Your site will be live at `https://<your-org>.github.io/blastodb/`

## Customising

- Update the news items in `index.html`
- Replace placeholder content in each page as data becomes available
- The contact form in `contact.html` currently alerts users to email directly — wire it up to [Formspree](https://formspree.io) or similar for real form submissions without a backend


# Data Entery
Here is a short tutorial on how to input data into the website.
There are four pages, in which data can be entered over a *.json* file:
1. News
2. Publications
3. Subtypes

## News
Loading the news page dynamically is currently in progress.

## Publications
Publications are stored in *data/publications.json*. They are stored in the *.json* file format, looking like this:
```json
  {
      "title": "Write the Paper Title Here",
      "venue": "Journal of Example Publications",
      "date": "20. April 2026",
      "authors": ["E. Mustermann", "J. Doe", "J. Smith"], #Each author must be separated by a comma, if there is more than one
      "tags": ["clynical trial", "journal article"], #Each tag must be separated by a comma, if there are more than one
      "url": "https://www.link_to_the_paper.com",
      "image": "https://www.link_to_the_paper.com", #leave empty if there is no image
      "imageAlt": "Short description of the image" #leave empty of there is no image
    },
```
Each publication needs at least the title, where it was published, the date (year, month+year, or day+month+year), authors, and ideally some tags.
The url/link to the paper is optional.
An image can optionally be added. If you add one, describe it shortly in *imageAlt*.


**Add new Publications:**
New publications can be added to the site by adding them at the end of the *publications.json* file, like so:
```json
      ...
      "image": "",
      "imageAlt": ""
    },
    {
      "title": "Advancing research on Blastocystis through a One Health approach",
      "venue": "Open research Europe",
      "date": "July 2024",
      "authors": [],
      "tags": ["journal article"],
      "url": "https://open-research-europe.ec.europa.eu/articles/4-145/v1",
      "image": "",
      "imageAlt": ""
    }, #<-add a comma here!
    { #<-here begins the new publication
        "title": "New Publication",
        "venue": "Journal of New Publications",
        "date": "2026",
        "authors": ["F. Author, S. Author"],
        "tags": ["journal article"],
        "url": "https://www.link_to_new_publication.com",
        "image": "",
        "imageAlt": ""
    } #<-entery ends here
  ] #make shure the parenthesies are closed correctly, like here.
}
```

You can also edit the existing data by changing the atributes of existing publications.

**Add new Tags:**
All tags which are used in the publications must also be stored in a list in the beginning of a file. If you wand to add a new tag, you can do that by adding it to the *"tagOptions"* at the beginning of the *publications.json* file. Don't forget, that after each tag, there must be a comma:
```json
  {
    "tagOptions": [
      "clynical trial",
      "prevalence",
      "microbiome",
      "journal article", #<- add a comma here
      "my_new_tag" #<- add the new tag here. It needs to be in quotationmarks.
    ],
    "publications": [
      {
        "title": "Single-celled organisms set for greater role in gut health",
        "venue": "Nature Outlooks",
  ...
```

## Subtypes

Data about the subtypes are stored in *data/subtypes.json*. The data is in the *.json* format. Each subtype contains the following attributes:
```json
    {
      "id": "st1", #ID of the subtype
      "title": "Subtype 1",#title that is displayed on the website
      "tags": ["humans", "animals"],#tags of the subtype
      "image": "images/subtypes/ST1.jpg", #optional link to an image, empty ("") if there is none
      "imageAlt": "Illustrative image for Blastocystis subtype 1", #short description of the image
      "imageCredit": "",#credit for the image. Leave empty if not nessecary
      "fasta": "fasta/Blastocystis_ST1.fasta", #link to the fasta data
      "culture_microbiome": "",#link to the microbiome data
      "culture_metabolome": "",#link to the metabolome data
      "description": "Blastocystis subtype 1 has been observed in humans and animals." #short description of the subtype (optional=
    },
```

You can add new subtypes by adding a new entery to the *"subtypes"* part.
To edit, search for an ecisting subtype and edit its information in the file.

To add a new subtype, add a new entery at the end of the *subtypes.json* file:

```json
      ...
      "culture_metabolome": "",
      "description": "Details coming soon."
    }, #<-Make shure this comma is there
    { #<-Start the new entery
      "id": "st45",
      "title": "Subtype 45",
      "tags": ["humans"],
      "image": "",
      "imageAlt": "",
      "imageCredit": "",
      "fasta": "https://www.zenodo_link_to_the_data.com",
      "culture_microbiome": "https://www.zenodo_link_to_the_data.com",
      "culture_metabolome": "https://www.zenodo_link_to_the_data.com",
      "description": "Here you can read a short description about the new subtype."
    }#<-End of the new entery
  ] #make shure the parenthesies are closed correctly, like here.
}

```


**Add new Tags:**
All tags which are used for subtypes must also be stored in a list in the beginning of a file. If you wand to add a new tag, you can do that by adding it to the *"tagOptions"* at the beginning of the *subtypes.json* file. Don't forget, that after each tag, there must be a comma:
```json
{
  "tagOptions": [
    "humans",
    "animals", #<- add a comma here
    "my_new_tag" #<- add the new tag here. It needs to be in quotationmarks.
  ],
  "subtypes": [
    {
      "id": "st1",
      "title": "Subtype 1",
  ...
```
